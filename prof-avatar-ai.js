/* =========================================================
   BSS1815 PRO-MAX DMP
   PROF AVATAR AI
   FILE: prof-avatar-ai.js

   FLOW:
   MICROPHONE → GEMINI → VOICE
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     ELEMENTS
     ======================================================= */

  const professorVideo =
    document.getElementById("profAvatarVideo");

  const talkButton =
    document.getElementById("talkToProfessor");

  const professorStatus =
    document.getElementById("profStatus");


  /* =======================================================
     BROWSER SPEECH RECOGNITION
     ======================================================= */

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  let recognition = null;

  let isListening = false;

  let isSpeaking = false;


  /* =======================================================
     STATUS
     ======================================================= */

  function setStatus(text) {
    if (professorStatus) {
      professorStatus.textContent = text;
    }
  }


  /* =======================================================
     BUTTON
     ======================================================= */

  function resetButton() {
    if (!talkButton) {
      return;
    }

    talkButton.disabled = false;

    talkButton.textContent =
      "🎤 PALE AK PWOFESÈ A";
  }


  /* =======================================================
     LANGUAGE DETECTION
     ======================================================= */

  function detectLanguage(text) {
    const value =
      String(text || "").toLowerCase();


    const creoleWords = [
      "mwen",
      "kisa",
      "kijan",
      "poukisa",
      "eske",
      "pou",
      "avèk",
      "kote",
      "nan",
      "yon",
      "reponn",
      "eksplike"
    ];


    const frenchWords = [
      "bonjour",
      "comment",
      "pourquoi",
      "avec",
      "dans",
      "explique",
      "quelle",
      "quel",
      "est-ce",
      "professeur"
    ];


    const spanishWords = [
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
        word => value.includes(word)
      )
    ) {
      return "ht-HT";
    }


    if (
      frenchWords.some(
        word => value.includes(word)
      )
    ) {
      return "fr-FR";
    }


    if (
      spanishWords.some(
        word => value.includes(word)
      )
    ) {
      return "es-US";
    }


    return "en-US";
  }


  /* =======================================================
     FIND VOICE
     ======================================================= */

  function findVoice(language) {
    const voices =
      window.speechSynthesis.getVoices();


    if (!voices.length) {
      return null;
    }


    const languagePrefix =
      language
        .split("-")[0]
        .toLowerCase();


    let voice =
      voices.find(
        item =>
          item.lang
            .toLowerCase() ===
          language.toLowerCase()
      );


    if (!voice) {
      voice =
        voices.find(
          item =>
            item.lang
              .toLowerCase()
              .startsWith(
                languagePrefix
              )
        );
    }


    /*
      FALLBACK POU KREYÒL
    */

    if (
      !voice &&
      language === "ht-HT"
    ) {
      voice =
        voices.find(
          item =>
            item.lang
              .toLowerCase()
              .startsWith("fr")
        );
    }


    /*
      FINAL FALLBACK
    */

    if (!voice) {
      voice = voices[0];
    }


    return voice;
  }


  /* =======================================================
     PROFESSOR SPEAK
     ======================================================= */

  function professorSpeak(
    answer,
    language
  ) {

    if (
      !("speechSynthesis" in window)
    ) {
      setStatus(
        "Vwa pa disponib sou navigatè sa a."
      );

      resetButton();

      return;
    }


    window.speechSynthesis.cancel();


    const speech =
      new SpeechSynthesisUtterance(
        answer
      );


    speech.lang = language;

    speech.rate = 0.92;

    speech.pitch = 1;

    speech.volume = 1;


    const voice =
      findVoice(language);


    if (voice) {
      speech.voice = voice;
    }


    speech.onstart = async () => {

      isSpeaking = true;


      setStatus(
        "🔊 PWOFESÈ A AP REPONN..."
      );


      if (talkButton) {
        talkButton.disabled = true;

        talkButton.textContent =
          "🔊 PWOFESÈ A AP PALE...";
      }


      /*
        JWE VIDEO AVATAR LA
        PANDAN REPONS LAN AP PALE
      */

      if (professorVideo) {

        try {

          professorVideo.currentTime = 0;

          professorVideo.muted = true;

          professorVideo.loop = true;

          await professorVideo.play();

        } catch (error) {

          console.log(
            "Professor video:",
            error
          );

        }

      }

    };


    speech.onend = () => {

      isSpeaking = false;


      if (professorVideo) {

        professorVideo.pause();

        professorVideo.currentTime = 0;

      }


      setStatus(
        "🎤 POZE YON LÒT KESYON"
      );


      resetButton();

    };


    speech.onerror = event => {

      isSpeaking = false;


      console.error(
        "VOICE ERROR:",
        event
      );


      if (professorVideo) {
        professorVideo.pause();
      }


      setStatus(
        "⚠️ PWOBLÈM AK VWA A."
      );


      resetButton();

    };


    window.speechSynthesis.speak(
      speech
    );
  }


  /* =======================================================
     SEND QUESTION TO GEMINI
     ======================================================= */

  async function askGemini(
    question
  ) {

    setStatus(
      "🧠 PWOFESÈ A AP REFLECHI..."
    );


    if (talkButton) {

      talkButton.disabled = true;

      talkButton.textContent =
        "🧠 AP REFLECHI...";

    }


    try {

      const response =
        await fetch(
          "/.netlify/functions/professor",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              question: question
            })
          }
        );


      let data;


      try {

        data =
          await response.json();

      } catch {

        throw new Error(
          "Server la pa retounen JSON."
        );

      }


      if (!response.ok) {

        throw new Error(
          data?.error ||
          "Gemini connection failed."
        );

      }


      if (!data.answer) {

        throw new Error(
          "Gemini pa retounen repons."
        );

      }


      /*
        DETEKTE LANG KESYON AN
      */

      const language =
        detectLanguage(question);


      /*
        REPONS LAN PA PARÈT
        KÒM TÈKS.

        LI ALE DIRÈK NAN VWA.
      */

      professorSpeak(
        data.answer,
        language
      );


    } catch (error) {

      console.error(
        "PROFESSOR AI ERROR:",
        error
      );


      setStatus(
        "⚠️ PWOFESÈ A PA RIVE KONEKTE AK GEMINI."
      );


      resetButton();

    }

  }


  /* =======================================================
     START MICROPHONE
     ======================================================= */

  function startListening() {

    if (isSpeaking) {

      window.speechSynthesis.cancel();

      isSpeaking = false;

    }


    if (!SpeechRecognition) {

      setStatus(
        "⚠️ NAVIGATÈ SA A PA SIPÒTE MICROPHONE VOICE RECOGNITION."
      );

      return;
    }


    if (isListening) {
      return;
    }


    recognition =
      new SpeechRecognition();


    /*
      DEFAULT MICROPHONE LANGUAGE.

      Gemini ap reponn nan lang
      kestyon an.
    */

    recognition.lang =
      document.documentElement.lang === "fr"
        ? "fr-FR"
        : document.documentElement.lang === "en"
          ? "en-US"
          : "ht-HT";


    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;


    recognition.onstart = () => {

      isListening = true;


      setStatus(
        "🎤 M AP KOUTE KESYON OU..."
      );


      if (talkButton) {

        talkButton.disabled = true;

        talkButton.textContent =
          "🎤 M AP KOUTE...";

      }

    };


    recognition.onresult =
      event => {

        isListening = false;


        const result =
          event.results[0];


        if (!result) {

          setStatus(
            "Mwen pa t tande kestyon an."
          );

          resetButton();

          return;
        }


        const question =
          result[0]
            .transcript
            .trim();


        if (!question) {

          setStatus(
            "Mwen pa t tande kestyon an."
          );

          resetButton();

          return;
        }


        console.log(
          "STUDENT QUESTION:",
          question
        );


        askGemini(
          question
        );

      };


    recognition.onerror =
      event => {

        isListening = false;


        console.error(
          "MICROPHONE ERROR:",
          event.error
        );


        if (
          event.error ===
          "not-allowed"
        ) {

          setStatus(
            "🎤 BAY SIT LA PÈMISYON POU ITILIZE MICROPHONE LA."
          );

        }

        else if (
          event.error ===
          "no-speech"
        ) {

          setStatus(
            "🎤 MWEN PA T TANDE KESYON AN. ESEYE ANKÒ."
          );

        }

        else {

          setStatus(
            "⚠️ MICROPHONE LA PA T KAPAB TANDE KESYON AN."
          );

        }


        resetButton();

      };


    recognition.onend = () => {

      isListening = false;

    };


    try {

      recognition.start();

    } catch (error) {

      console.error(
        "START MICROPHONE ERROR:",
        error
      );


      isListening = false;


      resetButton();

    }

  }


  /* =======================================================
     CONNECT BUTTON
     ======================================================= */

  if (talkButton) {

    talkButton.addEventListener(
      "click",
      startListening
    );

  }


  /* =======================================================
     LOAD DEVICE VOICES
     ======================================================= */

  if (
    "speechSynthesis" in window
  ) {

    window.speechSynthesis
      .getVoices();


    window.speechSynthesis
      .onvoiceschanged = () => {

        window.speechSynthesis
          .getVoices();

      };

  }


  /* =======================================================
     READY
     ======================================================= */

  setStatus(
    "🎤 PALE AK PWOFESÈ A"
  );


  console.log(
    "BSS1815 PROF AVATAR AI READY"
  );

})();
