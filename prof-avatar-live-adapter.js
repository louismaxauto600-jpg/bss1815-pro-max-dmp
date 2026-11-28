
/* =========================================================
   BSS1815 PRO-MAX DMP
   PROF AVATAR LIVE ADAPTER
   FILE: prof-avatar-live-adapter.js
   VERSION: 1.1.0
   ========================================================= */

"use strict";

(() => {

  const API = "https://api.liveavatar.com/v1/sessions";

  function create({

    request,
    Room,
    RoomEvent,
    video,
    audio,
    project = "bss1815",
    school = ""

  } = {}) {

    if (
      typeof request !== "function" ||
      typeof Room !== "function" ||
      !RoomEvent ||
      !video ||
      !audio
    ) {

      throw Error("Missing live avatar configuration.");

    }

    let token = null;
    let room = null;
    let socket = null;
    let ready = false;
    let busy = false;
    let pending = null;

    const tracks = new Set();

    /* LIVE AVATAR PROVIDER */

    async function provider(action) {

      const c = new AbortController();

      const timer = setTimeout(
        () => c.abort(),
        15000
      );

      try {

        const r = await fetch(API + "/" + action, {

          method: "POST",

          headers: {

            Authorization: "Bearer " + token,

            "Content-Type": "application/json",

            Accept: "application/json"

          },

          body: "{}",

          signal: c.signal,

          cache: "no-store",

          redirect: "error",

          keepalive: action === "stop"

        });

        if (!r.ok) {

          throw Error(
            "Avatar " + action + ": HTTP " + r.status
          );

        }

        if (action === "start") {

          return (await r.json()).data;

        }

      } finally {

        clearTimeout(timer);

      }

    }

    /* SPEECH COMPLETION */

    function finish(error) {

      if (!pending) return;

      const job = pending;

      pending = null;

      clearTimeout(job.timer);

      if (error) {

        job.reject(error);

      } else {

        job.resolve();

      }

    }

    /* LIVE SOCKET COMMANDS */

    function send(type, fields = {}) {

      if (

        !ready ||

        socket?.readyState !== WebSocket.OPEN

      ) {

        throw Error("Avatar connection is not ready.");

      }

      socket.send(

        JSON.stringify({ type, ...fields })

      );

    }

    /* REAL-TIME CONNECTION */

    function connectSocket(url) {

      if (new URL(url).protocol !== "wss:") {

        throw Error("Invalid socket URL.");

      }

      return new Promise((resolve, reject) => {

        const ws = socket = new WebSocket(url);

        const timer = setTimeout(

          () => fail("Avatar connection timed out."),

          15000

        );

        function fail(message) {

          clearTimeout(timer);

          if (socket === ws) {

            ready = false;

            finish(Error(message));

          }

          reject(Error(message));

        }

        ws.addEventListener(

          "error",

          () => fail("Avatar socket error.")

        );

        ws.addEventListener(

          "close",

          () => fail("Avatar connection closed.")

        );

        ws.addEventListener("message", e => {

          if (socket !== ws) return;

          let d;

          try {

            d = JSON.parse(e.data);

          } catch {

            return;

          }

          if (d.type === "session.state_updated") {

            if (d.state === "connected") {

              ready = true;

              clearTimeout(timer);

              resolve();

            } else if (d.state === "disconnected") {

              fail("Avatar session ended.");

            }

          }

          if (!pending) return;

          if (d.type === "error") {

            finish(Error("Avatar rejected audio."));

            return;

          }

          if (

            d.source_event_id &&

            d.source_event_id !== pending.id

          ) return;

          if (d.type === "agent.speak_started") {

            pending.started = true;

          }

          if (

            d.type === "agent.state_updated" &&

            d.state === "speaking"

          ) {

            pending.started = true;

          }

          if (

            d.type === "agent.speak_ended" ||

            (

              d.type === "agent.state_updated" &&

              pending.started &&

              ["idle", "listening"].includes(d.state)

            )

          ) {

            finish();

          }

          if (d.type === "agent.speak_interrupted") {

            finish(Error("Speech interrupted."));

          }

        });

      });

    }

    /* STOP LIVE SESSION */

    async function stop() {

      ready = false;

      finish(Error("Session stopped."));

      const ws = socket;

      socket = null;

      try {

        if (token) {

          await provider("stop");

          token = null;

        }

      } finally {

        if (ws) ws.close();

        for (const track of tracks) {

          try {

            track.detach();

          } catch {}

        }

        tracks.clear();

        if (room) {

          try {

            await room.disconnect();

          } catch {}

          room = null;

        }

        video.srcObject = null;

        audio.srcObject = null;

      }

    }

    /* ACTIVATE EXISTING PROF AVATAR */

    async function start() {

      if (busy || token) {

        throw Error("Session already active.");

      }

      busy = true;

      try {

        const r = await request({

          action: "avatar-session",

          project,

          school

        });

        if (

          r?.success !== true ||

          !r.session?.session_token

        ) {

          throw Error(

            r?.message || "Avatar session unavailable."

          );

        }

        token = r.session.session_token;

        const s = await provider("start");

        if (

          !s?.livekit_url ||

          !s.livekit_client_token ||

          !s.ws_url

        ) {

          throw Error("Incomplete avatar session.");

        }

        room = new Room();

        room.on(RoomEvent.TrackSubscribed, track => {

          if (

            !["video", "audio"].includes(track.kind)

          ) return;

          tracks.add(track);

          track.attach(

            track.kind === "video" ? video : audio

          );

        });

        room.on(RoomEvent.TrackUnsubscribed, track => {

          track.detach();

          tracks.delete(track);

        });

        await room.connect(

          s.livekit_url,

          s.livekit_client_token

        );

        await connectSocket(s.ws_url);

      } catch (e) {

        try {

          await stop();

        } catch {}

        throw e;

      } finally {

        busy = false;

      }

    }

    /* MAXIMAX VOICE — LIVE LIP SYNC */

    async function speak({ text } = {}) {

      if (!ready || busy || pending) {

        throw Error("Avatar is not ready or is busy.");

      }

      if (

        typeof text !== "string" ||

        !text.trim() ||

        text.length > 1500

      ) {

        throw Error("Provide 1–1500 characters.");

      }

      busy = true;

      try {

        const r = await request({

          action: "speak",

          text: text.trim(),

          project,

          school

        });

        const a = r?.audio;

        if (

          r?.success !== true ||

          a?.encoding !== "base64" ||

          a.format !== "pcm_s16le" ||

          a.sampleRate !== 24000 ||

          a.channels !== 1

        ) {

          throw Error(

            r?.message || "Invalid speech audio."

          );

        }

        const bytes = atob(a.data);

        if (

          !bytes.length ||

          bytes.length % 2 ||

          bytes.length > 2000000

        ) {

          throw Error("Invalid PCM length.");

        }

        const id = crypto.randomUUID();

        await new Promise((resolve, reject) => {

          pending = {

            id,

            resolve,

            reject,

            started: false,

            timer: setTimeout(() => {

              try {

                send("agent.interrupt", {

                  event_id: crypto.randomUUID()

                });

              } catch {}

              finish(Error("Avatar speech timed out."));

            }, Math.ceil(bytes.length / 48) + 20000)

          };

          try {

            for (

              let i = 0;

              i < bytes.length;

              i += 48000

            ) {

              send("agent.speak", {

                event_id: id,

                audio: btoa(

                  bytes.slice(i, i + 48000)

                )

              });

            }

            send("agent.speak_end", {

              event_id: id

            });

          } catch (e) {

            finish(e);

          }

        });

      } finally {

        busy = false;

      }

    }

    return Object.freeze({

      start,

      speak,

      stop

    });

  }

  window.BSS1815_LIVE_AVATAR_ADAPTER =

    Object.freeze({ create });

})();

/* =========================================================
   END — BSS1815 PRO-MAX DMP
   DEVAN DEVAN NÈT
   ========================================================= */
