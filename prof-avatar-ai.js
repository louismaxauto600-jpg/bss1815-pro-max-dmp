/* =========================================================
   BSS1815 PRO-MAX DMP
   PROF AVATAR AI
   FILE: prof-avatar-ai.js

   FLOW:
   MICROPHONE / TEXT
   ↓
   NETLIFY FUNCTION
   ↓
   GEMINI
   ↓
   PROFESSOR VOICE

   FIXES:
   - Microphone pa rete kole sou "M AP KOUTE"
   - Timeout otomatik
   - onend reset
   - Button listening animation
   - Text form travay kòm fallback
   - Pi bon language selection
   - Pi bon error messages
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

    var pageLanguage =
      getPageLanguage();

    /*
      Android / Chrome pa toujou byen sipòte ht-HT
      nan Web Speech API.

      Kreyòl la eseye ht-HT dabò.
    */

    if (pageLanguage === "fr") {
      return "fr-FR";
    }

    if (pageLanguage === "en") {
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
      "tanpri",
      "sa",
      "ki",
      "ou"
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
      "est-ce",
      "professeur",
      "merci",
      "pouvez"
    ];

    var spanishWords = [
      "hola",
      "como",
      "cómo",
      "porque",
      "por qué",
      "explica",
      "profesor",
      "gracias"
    ];

    if (
      creoleWords.some(
        function (word) {
          return value.indexOf(word) !== -1;
        }
      )
    ) {
      return "ht-HT";
    }

    if (
      frenchWords.some(
        function (word) {
          return value.indexOf(word) !== -1;
        }
      )
    ) {
      return "fr-FR";
    }

    if (
      spanishWords.some(
        function (word) {
          return value.indexOf(word) !== -1;
        }
      )
    ) {
      return "es-US";
    }

    if (
      getPageLanguage() === "fr"
    ) {
      return "fr-FR";
    }

    if (
      getPageLanguage() === "ht"
    ) {
      return "ht-HT";
    }

    return "en-US";

  }


  /* ======================================================
     VOICE SELECTION
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
      voices.find(
        function (item) {

          return (
            String(item.lang)
              .toLowerCase() ===
            language.toLowerCase()
          );

        }
      );

    if (!voice) {

      voice =
        voices.find(
          function (item) {

            return (
              String(item.lang)
                .toLowerCase()
                .indexOf(prefix) === 0
            );

          }
        );

    }

    /*
      Sou anpil Android pa gen vwa Kreyòl.
      French sèvi kòm fallback.
    */

    if (
      !voice &&
      language === "ht-HT"
    ) {

      voice =
        voices.find(
          function (item) {

            return (
              String(item.lang)
                .toLowerCase()
                .indexOf("fr") === 0
            );

          }
        );

    }

    if (!voice) {

      voice =
        voices.find(
          function (item) {

            return (
              String(item.lang)
                .toLowerCase()
                .indexOf("en") === 0
            );

          }
        );

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
        "⚠️ NAVIGATÈ SA A PA GEN SISTÈM VWA."
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
     SEND QUESTION TO GEMINI
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
      "🧠 PWOFESÈ A AP REFLECHI..."
    );


    if (talkButton) {

      talkButton.disabled = true;

      talkButton.textContent =
        "🧠 AP REFLECHI...";

    }


    try {

      var response =
        await fetch(
          "/.netlify/functions/professor",
          {
            method:"POST",

            headers:{
              "Content-Type":
                "application/json"
            },

            body:JSON.stringify({
              question:question
            })
          }
        );


      var text =
        await response.text();


      var data;

      try {

        data =
          JSON.parse(text);

      } catch (error) {

        console.error(
          "SERVER RESPONSE:",
          text
        );

        throw new Error(
          "Server la pa retounen JSON."
        );

      }


      if (!response.ok) {

        throw new Error(
          data &&
          data.error
            ? data.error
            : "Gemini connection failed."
        );

      }


      if (
        !data ||
        !data.answer
      ) {

        throw new Error(
          "Gemini pa retounen okenn repons."
        );

      }


      var language =
        detectLanguage(question);


      /*
        Repons lan pa bezwen parèt kòm tèks.
        Nou kite answerBox hidden.
      */

      if (answerBox) {

        answerBox.hidden = true;

        answerBox.textContent = "";

      }


      professorSpeak(
        data.answer,
        language
      );


    } catch (error) {

      console.error(
        "PROFESSOR AI ERROR:",
        error
      );

      var message =
        String(
          error &&
          error.message
            ? error.message
            : ""
        );


      if (
        message.indexOf(
          "GEMINI_API_KEY"
        ) !== -1
      ) {

        setStatus(
          "⚠️ GEMINI API KEY PA DISPONIB SOU NETLIFY."
        );

      } else {

        setStatus(
          "⚠️ PWOFESÈ A PA RIVE KONEKTE AK GEMINI."
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
        "⚠️ NAVIGATÈ SA A PA SIPÒTE MICROPHONE VOICE RECOGNITION."
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


    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 3;


    recognition.onstart =
      function () {

        isListening = true;

        receivedResult = false;

        setStatus(
          "🎤 M AP KOUTE KESYON OU..."
        );


        if (talkButton) {

          talkButton.disabled = false;

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
                  "🎤 MWEN PA T TANDE KESYON AN. PEZE MICROPHONE LA E ESEYE ANKÒ."
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
          "🎙️ MWEN TANDE W. KONTINYE PALE..."
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
            "🎤 MWEN PA T KONPRANN KESYON AN. ESEYE ANKÒ."
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
            "🎤 BAY SIT LA PÈMISYON POU ITILIZE MICROPHONE LA."
          );

        } else if (
          event.error ===
          "audio-capture"
        ) {

          setStatus(
            "⚠️ MICROPHONE LA PA DISPONIB SOU APARÈY LA."
          );

        } else if (
          event.error ===
          "no-speech"
        ) {

          setStatus(
            "🎤 MWEN PA T TANDE KESYON AN. ESEYE ANKÒ."
          );

        } else if (
          event.error ===
          "network"
        ) {

          setStatus(
            "⚠️ VOICE RECOGNITION PA RIVE KONEKTE AK REZO A."
          );

        } else if (
          event.error ===
          "language-not-supported"
        ) {

          setStatus(
            "⚠️ LANG MICROPHONE SA A PA SIPÒTE. CHWAZI ENG OSWA FRA E ESEYE ANKÒ."
          );

        } else if (
          event.error ===
          "aborted"
        ) {

          setStatus(
            "🎤 MICROPHONE LA KANPE."
          );

        } else {

          setStatus(
            "⚠️ MICROPHONE LA PA RIVE TANDE KESYON AN."
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


        /*
          FIX PRINCIPAL:
          Ansyen kòd la te kite bouton an
          kole sou M AP KOUTE si pa gen result.
        */

        if (!receivedResult) {

          if (
            professorStatus &&
            professorStatus.textContent
              .indexOf(
                "AP REFLECHI"
              ) === -1
          ) {

            setStatus(
              "🎤 PEZE MICROPHONE LA POU POZE KESYON OU."
            );

          }

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
        "⚠️ MICROPHONE LA PA KAPAB KÒMANSE. ESEYE ANKÒ."
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
      function () {

        startListening();

      }
    );

  }


  /* ======================================================
     TEXT FALLBACK
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
            "Ekri oswa pale yon kestyon."
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
     LOAD AVAILABLE VOICES
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

})();
