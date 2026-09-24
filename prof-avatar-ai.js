/* =========================================================
   BSS1815 PRO-MAX DMP
   PROF AVATAR AI
   FILE: prof-avatar-ai.js

   FLOW:
   MICROPHONE / TEXT
   ↓
   NETLIFY FUNCTION
   /.netlify/functions/professor
   ↓
   GEMINI
   ↓
   PROFESSOR VOICE

   DIAGNOSTIC VERSION
   - Shows exact HTTP/backend error
   - Detects 404 / 403 / 429 / 500
   - Detects network/fetch failure
   - Keeps microphone working
   - Keeps text test available
   - Does NOT expose API key
   ========================================================= */

(function () {
  "use strict";

  /* ======================================================
     ELEMENTS
     ====================================================== */

  var professorVideo =
    document.getElementById("profAvatarVideo");

  var talkButton =
    document.getElementById("talkToProfessor");

  var professorStatus =
    document.getElementById("profStatus");

  var askForm =
    document.getElementById("profAskForm");

  var questionInput =
    document.getElementById("profQuestion");

  var answerBox =
    document.getElementById("profAnswer");


  /* ======================================================
     NETLIFY FUNCTION
     ====================================================== */

  var PROFESSOR_FUNCTION =
    window.location.origin +
    "/.netlify/functions/professor";


  /* ======================================================
     SPEECH RECOGNITION
     ====================================================== */

  var SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  var recognition = null;

  var isListening = false;
  var isSpeaking = false;
  var receivedResult = false;

  var listenTimer = null;

  var LISTEN_TIMEOUT = 15000;


  /* ======================================================
     HELPERS
     ====================================================== */

  function setStatus(text) {
    if (professorStatus) {
      professorStatus.textContent = text;
    }
  }


  function getPageLanguage() {

    var activeButton =
      document.querySelector(
        ".lang-btn.active[data-lang]"
      );

    if (activeButton) {

      var selected =
        String(
          activeButton.dataset.lang || ""
        ).toLowerCase();

      if (
        selected === "fr" ||
        selected === "en" ||
        selected === "ht"
      ) {
        return selected;
      }

    }


    var lang =
      String(
        document.documentElement.lang || "ht"
      ).toLowerCase();


    if (lang.indexOf("fr") === 0) {
      return "fr";
    }

    if (lang.indexOf("en") === 0) {
      return "en";
    }

    return "ht";
  }


  function getRecognitionLanguage() {

    var language =
      getPageLanguage();

    if (language === "fr") {
      return "fr-FR";
    }

    if (language === "en") {
      return "en-US";
    }

    return "ht-HT";
  }


  function getButtonDefaultText() {

    var language =
      getPageLanguage();

    if (language === "fr") {
      return "🎤 PARLER AU PROFESSEUR";
    }

    if (language === "en") {
      return "🎤 TALK TO THE PROFESSOR";
    }

    return "🎤 PALE AK PWOFESÈ A";
  }


  function resetButton() {

    if (!talkButton) {
      return;
    }

    talkButton.disabled = false;

    talkButton.classList.remove(
      "listening"
    );

    talkButton.textContent =
      getButtonDefaultText();
  }


  function stopListenTimer() {

    if (listenTimer) {

      clearTimeout(
        listenTimer
      );

      listenTimer = null;
    }
  }


  function stopRecognition() {

    stopListenTimer();

    if (recognition) {

      try {
        recognition.stop();
      } catch (error) {}

    }

    recognition = null;
    isListening = false;

    if (talkButton) {

      talkButton.classList.remove(
        "listening"
      );
    }
  }


  /* ======================================================
     LANGUAGE DETECTION
     ====================================================== */

  function detectLanguage(text) {

    var value =
      String(text || "")
        .toLowerCase();


    var creoleWords = [
      "mwen",
      "kisa",
      "kijan",
      "poukisa",
      "eske",
      "èske",
      "pou",
      "avèk",
      "kote",
      "nan",
      "yon",
      "reponn",
      "eksplike",
      "pwofesè",
      "tanpri"
    ];


    var frenchWords = [
      "bonjour",
      "comment",
      "pourquoi",
      "avec",
      "dans",
      "explique",
      "quelle",
      "quel",
      "professeur",
      "merci"
    ];


    var spanishWords = [
      "hola",
      "como",
      "cómo",
      "porque",
      "por qué",
      "profesor",
      "gracias"
    ];


    if (
      creoleWords.some(function (word) {
        return value.indexOf(word) !== -1;
      })
    ) {
      return "ht-HT";
    }


    if (
      frenchWords.some(function (word) {
        return value.indexOf(word) !== -1;
      })
    ) {
      return "fr-FR";
    }


    if (
      spanishWords.some(function (word) {
        return value.indexOf(word) !== -1;
      })
    ) {
      return "es-US";
    }


    if (getPageLanguage() === "fr") {
      return "fr-FR";
    }

    if (getPageLanguage() === "ht") {
      return "ht-HT";
    }

    return "en-US";
  }


  /* ======================================================
     VOICE
     ====================================================== */

  function findVoice(language) {

    if (
      !("speechSynthesis" in window)
    ) {
      return null;
    }


    var voices =
      window.speechSynthesis.getVoices();


    if (!voices.length) {
      return null;
    }


    var prefix =
      language
        .split("-")[0]
        .toLowerCase();


    var voice =
      voices.find(function (item) {

        return (
          String(item.lang)
            .toLowerCase() ===
          language.toLowerCase()
        );

      });


    if (!voice) {

      voice =
        voices.find(function (item) {

          return (
            String(item.lang)
              .toLowerCase()
              .indexOf(prefix) === 0
          );

        });

    }


    if (
      !voice &&
      language === "ht-HT"
    ) {

      voice =
        voices.find(function (item) {

          return (
            String(item.lang)
              .toLowerCase()
              .indexOf("fr") === 0
          );

        });

    }


    if (!voice) {

      voice =
        voices.find(function (item) {

          return (
            String(item.lang)
              .toLowerCase()
              .indexOf("en") === 0
          );

        });

    }


    return voice || voices[0];
  }


  /* ======================================================
     PROFESSOR SPEAKS
     ====================================================== */

  function professorSpeak(
    answer,
    language
  ) {

    if (
      !("speechSynthesis" in window)
    ) {

      setStatus(
        "⚠️ VOICE SYSTEM PA DISPONIB."
      );

      resetButton();
      return;
    }


    window.speechSynthesis.cancel();


    var speech =
      new SpeechSynthesisUtterance(
        answer
      );


    speech.lang = language;
    speech.rate = 0.92;
    speech.pitch = 1;
    speech.volume = 1;


    var voice =
      findVoice(language);


    if (voice) {
      speech.voice = voice;
    }


    speech.onstart =
      function () {

        isSpeaking = true;

        setStatus(
          "🔊 PWOFESÈ A AP REPONN..."
        );


        if (talkButton) {

          talkButton.disabled = true;

          talkButton.textContent =
            "🔊 PWOFESÈ A AP PALE...";
        }


        if (professorVideo) {

          try {

            professorVideo.pause();

            professorVideo.currentTime = 0;

            professorVideo.muted = true;

            professorVideo.loop = true;


            var playPromise =
              professorVideo.play();


            if (
              playPromise &&
              playPromise.catch
            ) {

              playPromise.catch(
                function () {}
              );
            }

          } catch (error) {

            console.log(
              "Professor video error:",
              error
            );
          }
        }
      };


    speech.onend =
      function () {

        isSpeaking = false;


        if (professorVideo) {

          professorVideo.pause();

          professorVideo.currentTime = 0;

          professorVideo.loop = false;
        }


        setStatus(
          "🎤 POZE YON LÒT KESYON"
        );


        resetButton();
      };


    speech.onerror =
      function (event) {

        console.error(
          "VOICE ERROR:",
          event
        );


        isSpeaking = false;


        if (professorVideo) {

          professorVideo.pause();

          professorVideo.loop = false;
        }


        setStatus(
          "⚠️ PWOBLÈM AK VWA PWOFESÈ A."
        );


        resetButton();
      };


    try {

      window.speechSynthesis.speak(
        speech
      );

    } catch (error) {

      console.error(
        "SPEECH ERROR:",
        error
      );


      setStatus(
        "⚠️ PWOFESÈ A PA RIVE PALE."
      );


      resetButton();
    }
  }


  /* ======================================================
     DISPLAY PRECISE CONNECTION ERROR
     ====================================================== */

  function showProfessorError(
    status,
    message
  ) {

    message =
      String(message || "")
        .trim();


    if (status === 404) {

      setStatus(
        "⚠️ HTTP 404 — FUNCTION professor PA JWENN."
      );

      return;
    }


    if (status === 401) {

      setStatus(
        "⚠️ HTTP 401 — GEMINI AUTHORIZATION REFIZE."
      );

      return;
    }


    if (status === 403) {

      setStatus(
        "⚠️ HTTP 403 — GEMINI KEY / PERMISSION REFIZE."
      );

      return;
    }


    if (status === 429) {

      setStatus(
        "⚠️ HTTP 429 — GEMINI QUOTA / RATE LIMIT."
      );

      return;
    }


    if (status === 500) {

      if (
        message.indexOf(
          "GEMINI_API_KEY"
        ) !== -1
      ) {

        setStatus(
          "⚠️ HTTP 500 — NETLIFY PA JWENN GEMINI_API_KEY."
        );

      } else {

        setStatus(
          "⚠️ HTTP 500 — " +
          (message || "BACKEND ERROR.")
        );
      }

      return;
    }


    if (status === 502) {

      setStatus(
        "⚠️ HTTP 502 — " +
        (message || "GEMINI BACKEND ERROR.")
      );

      return;
    }


    setStatus(
      "⚠️ HTTP " +
      status +
      " — " +
      (
        message ||
        "PROFESSOR CONNECTION ERROR."
      )
    );
  }


  /* ======================================================
     SEND QUESTION
     ====================================================== */

  async function askGemini(
    question
  ) {

    question =
      String(question || "")
        .trim();


    if (!question) {

      setStatus(
        "🎤 MWEN PA JWENN KESYON AN."
      );

      resetButton();

      return;
    }


    stopRecognition();


    setStatus(
      "🧠 KONEKSYON AK PWOFESÈ A..."
    );


    if (talkButton) {

      talkButton.disabled = true;

      talkButton.textContent =
        "🧠 AP KONEKTE...";
    }


    console.log(
      "BSS1815 PROFESSOR ENDPOINT:",
      PROFESSOR_FUNCTION
    );


    console.log(
      "BSS1815 QUESTION:",
      question
    );


    try {

      var response =
        await fetch(
          PROFESSOR_FUNCTION,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              "Accept":
                "application/json"
            },

            cache: "no-store",

            credentials: "same-origin",

            body: JSON.stringify({
              question: question,
              source: "bss1815-prof-avatar",
              timestamp: Date.now()
            })
          }
        );


      console.log(
        "BSS1815 PROFESSOR HTTP:",
        response.status
      );


      var responseText =
        await response.text();


      console.log(
        "BSS1815 PROFESSOR RAW RESPONSE:",
        responseText
      );


      var data = null;


      if (responseText) {

        try {

          data =
            JSON.parse(
              responseText
            );

        } catch (jsonError) {

          console.error(
            "PROFESSOR JSON ERROR:",
            jsonError
          );
        }
      }


      if (!response.ok) {

        var backendMessage =

          data &&
          data.error

            ? data.error

            : responseText ||
              response.statusText ||
              "Backend error";


        console.error(
          "PROFESSOR BACKEND ERROR:",
          response.status,
          backendMessage
        );


        showProfessorError(
          response.status,
          backendMessage
        );


        resetButton();
        return;
      }


      if (
        !data ||
        data.success !== true ||
        !data.answer
      ) {

        console.error(
          "INVALID PROFESSOR RESPONSE:",
          data
        );


        setStatus(
          "⚠️ HTTP " +
          response.status +
          " — BACKEND PA RETOUNEN REPONS PWOFESÈ A."
        );


        resetButton();
        return;
      }


      console.log(
        "BSS1815 GEMINI SUCCESS"
      );


      if (answerBox) {

        answerBox.hidden = true;

        answerBox.textContent = "";
      }


      var language =
        detectLanguage(question);


      professorSpeak(
        data.answer,
        language
      );


    } catch (error) {

      console.error(
        "PROFESSOR FETCH ERROR:",
        error
      );


      var errorMessage =
        String(
          error &&
          error.message
            ? error.message
            : error
        );


      if (
        errorMessage
          .toLowerCase()
          .indexOf("failed to fetch") !== -1
      ) {

        setStatus(
          "⚠️ NETWORK ERROR — REQUEST LA PA RIVE NAN NETLIFY FUNCTION."
        );

      } else {

        setStatus(
          "⚠️ FETCH ERROR — " +
          errorMessage
        );
      }


      resetButton();
    }
  }


  /* ======================================================
     START MICROPHONE
     ====================================================== */

  function startListening() {

    if (isSpeaking) {

      if (
        "speechSynthesis" in window
      ) {

        window.speechSynthesis.cancel();
      }

      isSpeaking = false;
    }


    if (!SpeechRecognition) {

      setStatus(
        "⚠️ NAVIGATÈ SA A PA SIPÒTE VOICE RECOGNITION."
      );

      resetButton();
      return;
    }


    if (isListening) {

      stopRecognition();

      setStatus(
        "🎤 MICROPHONE LA KANPE."
      );

      resetButton();
      return;
    }


    receivedResult = false;


    recognition =
      new SpeechRecognition();


    recognition.lang =
      getRecognitionLanguage();


    recognition.continuous =
      false;


    recognition.interimResults =
      false;


    recognition.maxAlternatives =
      3;


    recognition.onstart =
      function () {

        isListening = true;

        receivedResult = false;


        setStatus(
          "🎤 M AP KOUTE KESYON OU..."
        );


        if (talkButton) {

          talkButton.disabled =
            false;

          talkButton.classList.add(
            "listening"
          );

          talkButton.textContent =
            "🎤 M AP KOUTE...";
        }


        stopListenTimer();


        listenTimer =
          setTimeout(
            function () {

              if (
                isListening &&
                !receivedResult
              ) {

                stopRecognition();

                setStatus(
                  "🎤 MWEN PA T TANDE KESYON AN. ESEYE ANKÒ."
                );

                resetButton();
              }

            },
            LISTEN_TIMEOUT
          );
      };


    recognition.onspeechstart =
      function () {

        setStatus(
          "🎙️ MWEN TANDE W..."
        );
      };


    recognition.onresult =
      function (event) {

        receivedResult = true;


        stopListenTimer();


        var transcript = "";


        if (
          event.results &&
          event.results.length
        ) {

          for (
            var i = 0;
            i < event.results.length;
            i++
          ) {

            if (
              event.results[i] &&
              event.results[i][0]
            ) {

              transcript +=
                event.results[i][0]
                  .transcript +
                " ";
            }
          }
        }


        transcript =
          transcript.trim();


        console.log(
          "STUDENT QUESTION:",
          transcript
        );


        if (!transcript) {

          stopRecognition();

          setStatus(
            "🎤 MWEN PA T KONPRANN KESYON AN."
          );

          resetButton();
          return;
        }


        askGemini(
          transcript
        );
      };


    recognition.onerror =
      function (event) {

        console.error(
          "MICROPHONE ERROR:",
          event.error
        );


        stopListenTimer();

        isListening = false;


        if (
          event.error ===
          "not-allowed"
        ) {

          setStatus(
            "🎤 BAY SIT LA PÈMISYON MICROPHONE."
          );


        } else if (
          event.error ===
          "audio-capture"
        ) {

          setStatus(
            "⚠️ MICROPHONE LA PA DISPONIB."
          );


        } else if (
          event.error ===
          "no-speech"
        ) {

          setStatus(
            "🎤 MWEN PA T TANDE KESYON AN."
          );


        } else if (
          event.error ===
          "network"
        ) {

          setStatus(
            "⚠️ VOICE RECOGNITION NETWORK ERROR."
          );


        } else if (
          event.error ===
          "language-not-supported"
        ) {

          setStatus(
            "⚠️ LANG MICROPHONE SA A PA SIPÒTE. ESEYE ENG OSWA FRA."
          );


        } else {

          setStatus(
            "⚠️ MICROPHONE ERROR — " +
            event.error
          );
        }


        resetButton();
      };


    recognition.onend =
      function () {

        stopListenTimer();

        isListening = false;


        if (talkButton) {

          talkButton.classList.remove(
            "listening"
          );
        }


        if (!receivedResult) {

          resetButton();
        }
      };


    try {

      recognition.start();

    } catch (error) {

      console.error(
        "START MICROPHONE ERROR:",
        error
      );


      isListening = false;


      setStatus(
        "⚠️ MICROPHONE LA PA KAPAB KÒMANSE."
      );


      resetButton();
    }
  }


  /* ======================================================
     MICROPHONE BUTTON
     ====================================================== */

  if (talkButton) {

    talkButton.addEventListener(
      "click",
      startListening
    );
  }


  /* ======================================================
     TEXT TEST
     ====================================================== */

  if (
    askForm &&
    questionInput
  ) {

    askForm.addEventListener(
      "submit",
      function (event) {

        event.preventDefault();


        var question =
          String(
            questionInput.value || ""
          ).trim();


        if (!question) {

          setStatus(
            "Ekri yon kestyon pou teste koneksyon an."
          );

          return;
        }


        askGemini(
          question
        );
      }
    );
  }


  /* ======================================================
     VOICES
     ====================================================== */

  if (
    "speechSynthesis" in window
  ) {

    window.speechSynthesis
      .getVoices();


    window.speechSynthesis
      .onvoiceschanged =
      function () {

        window.speechSynthesis
          .getVoices();
      };
  }


  /* ======================================================
     INITIAL STATE
     ====================================================== */

  setStatus(
    "🎤 PEZE MICROPHONE LA POU PALE AK PWOFESÈ A."
  );


  resetButton();


  console.log(
    "BSS1815 PROF AVATAR AI READY"
  );


  console.log(
    "PROFESSOR FUNCTION:",
    PROFESSOR_FUNCTION
  );

})();
