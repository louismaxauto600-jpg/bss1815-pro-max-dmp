
/* =========================================================
   BSS1815 PRO-MAX DMP
   PROF AVATAR LIVE ADAPTER
   FILE: prof-avatar-live-adapter.js
   VERSION: 1.0.0
   ========================================================= */

"use strict";

(() => {

  const API =
    "https://api.liveavatar.com/v1/sessions";

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

      throw new Error(
        "Missing authorized transport, LiveKit or media elements."
      );

    }

    let token = null;

    let room = null;

    let socket = null;

    let ready = false;

    let pending = null;

    let busy = false;

    const tracks = new Set();

    /* LIVE AVATAR PROVIDER */

    async function provider(action) {

      const controller =
        new AbortController();

      const timer = setTimeout(
        () => controller.abort(),
        15000
      );

      try {

        const r = await fetch(
          API + "/" + action,
          {

            method: "POST",

            headers: {

              Authorization: "Bearer " + token

            },

            signal: controller.signal,

            cache: "no-store",

            redirect: "error"

          }
        );

        if (!r.ok) {

          throw new Error(
            "Avatar " + action + ": HTTP " + r.status
          );

        }

        return action === "start"
          ? (await r.json()).data
          : null;

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

        !socket ||

        socket.readyState !== WebSocket.OPEN

      ) {

        throw new Error(
          "Avatar connection is not ready."
        );

      }

      socket.send(

        JSON.stringify({

          type,

          ...fields

        })

      );

    }

    /* REAL-TIME CONNECTION */

    async function connectSocket(url) {

      if (new URL(url).protocol !== "wss:") {

        throw new Error("Invalid socket URL.");

      }

      await new Promise((resolve, reject) => {

        const ws = socket = new WebSocket(url);

        const timer = setTimeout(

          () => reject(

            new Error("Avatar connection timed out.")

          ),

          15000

        );

        const fail = () => {

          ready = false;

          clearTimeout(timer);

          finish(
            new Error("Avatar connection closed.")
          );

          reject(
            new Error("Avatar connection closed.")
          );

        };

        ws.addEventListener("error", fail);

        ws.addEventListener("close", fail);

        ws.addEventListener("message", e => {

          let event;

          try {

            event = JSON.parse(e.data);

          } catch {

            return;

          }

          if (event.type === "session.state_updated") {

            if (event.state === "connected") {

              ready = true;

              clearTimeout(timer);

              resolve();

            } else if (

              event.state === "disconnected"

            ) {

              fail();

            }

          }

          if (!pending) return;

          if (event.type === "error") {

            finish(
              new Error("Avatar rejected audio.")
            );

          }

          if (!pending) return;

          if (event.source_event_id !== pending.id) {

            return;

          }

          if (event.type === "agent.speak_ended") {

            finish();

          }

          if (event.type === "agent.speak_interrupted") {

            finish(
              new Error("Speech interrupted.")
            );

          }

        });

      });

    }

    /* STOP SESSION */

    async function stop() {

      ready = false;

      finish(new Error("Session stopped."));

      if (socket) {

        socket.close();

        socket = null;

      }

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

      if (token) {

        try {

          await provider("stop");

        } finally {

          token = null;

        }

      }

    }

    /* ACTIVATE EXISTING PROF AVATAR */

    async function start() {

      if (busy || token) {

        throw new Error(
          "Session already active."
        );

      }

      busy = true;

      try {

        const result = await request({

          action: "avatar-session",

          project,

          school

        });

        if (

          result?.success !== true ||

          !result.session?.session_token

        ) {

          throw new Error(

            result?.message ||

            "Avatar session unavailable."

          );

        }

        token = result.session.session_token;

        const session = await provider("start");

        if (

          !session?.livekit_url ||

          !session.livekit_client_token ||

          !session.ws_url

        ) {

          throw new Error(
            "Incomplete avatar session."
          );

        }

        room = new Room();

        room.on(

          RoomEvent.TrackSubscribed,

          track => {

            if (

              track.kind !== "video" &&

              track.kind !== "audio"

            ) return;

            tracks.add(track);

            track.attach(

              track.kind === "video"

                ? video

                : audio

            );

          }

        );

        room.on(

          RoomEvent.TrackUnsubscribed,

          track => {

            track.detach();

            tracks.delete(track);

          }

        );

        await room.connect(

          session.livekit_url,

          session.livekit_client_token

        );

        await connectSocket(session.ws_url);

      } catch (error) {

        try {

          await stop();

        } catch {}

        throw error;

      } finally {

        busy = false;

      }

    }

    /* MAXIMAX VOICE — LIVE LIP SYNC */

    async function speak({ text } = {}) {

      if (!ready || busy || pending) {

        throw new Error(
          "Avatar is not ready or is busy."
        );

      }

      if (

        typeof text !== "string" ||

        !text.trim() ||

        text.length > 1500

      ) {

        throw new Error(
          "Provide 1–1500 characters."
        );

      }

      busy = true;

      try {

        const result = await request({

          action: "speak",

          text: text.trim()

        });

        const pcm = result?.audio;

        if (

          result?.success !== true ||

          pcm?.encoding !== "base64" ||

          pcm.format !== "pcm_s16le" ||

          pcm.sampleRate !== 24000 ||

          pcm.channels !== 1

        ) {

          throw new Error(

            result?.message ||

            "Invalid speech audio."

          );

        }

        const bytes = atob(pcm.data);

        if (

          !bytes.length ||

          bytes.length % 2 ||

          bytes.length > 2000000

        ) {

          throw new Error("Invalid PCM length.");

        }

        const id = crypto.randomUUID();

        await new Promise((resolve, reject) => {

          pending = {

            id,

            resolve,

            reject,

            timer: setTimeout(() => {

              try {

                send("agent.interrupt");

              } catch {}

              finish(

                new Error("Avatar speech timed out.")

              );

            },

            Math.ceil(
              bytes.length / 48000 * 1000
            ) + 20000)

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

          } catch (error) {

            finish(error);

          }

        });

      } finally {

        busy = false;

      }

    }

    /* CONTROLLER INTERFACE */

    return Object.freeze({

      start,

      speak,

      stop

    });

  }

  /* GLOBAL LIVE AVATAR ADAPTER */

  window.BSS1815_LIVE_AVATAR_ADAPTER =
    Object.freeze({

      create

    });

})();

/* =========================================================
   END — PROF AVATAR LIVE ADAPTER
   BSS1815 PRO-MAX DMP
   DEVAN DEVAN NÈT
   ========================================================= */
