/* prof-avatar-ai.js
   =========================================================
   BSS1815 PRO-MAX DMP
   PROF AVATAR AI — VOICE TO VOICE (+ ekri pou kreyòl)
   ========================================================= */

(function () {
  "use strict";

  const BSS_PROF_AI = {
    videoId: "profAvatarVideo",
    talkButtonId: "talkToProfessor",
    statusId: "profStatus",
    formId: "profAskForm",
    inputId: "profQuestion",
    answerId: "profAnswer",

    endpoint: "/.netlify/functions/professor",

    listening: false,
    busy: false,
    recognition: null,
    synth: window.speechSynthesis || null
  };


  /* =========================================================
     ELEMENTS
     ========================================================= */

  const profVideo = document.getElementById(BSS_PROF_AI.videoId);
  const talkButton = document.getElementById(BSS_PROF_AI.talkButtonId);
  const profStatus = document.getElementById(BSS_PROF_AI.statusId);
  const askForm = document.getElementById(BSS_PROF_AI.formId);
  const askInput = document.getElementById(BSS_PROF_AI.inputId);
  const answerBox = document.getElementById(BSS_PROF_AI.answerId);


  /* =========================================================
     LANG SIT LA
     ========================================================= */

  const VOICE_LANG = {
    ht: "ht-HT",
    fr: "fr-FR",
    en: "en-US",
    es: "es-ES"
  };

  const TEXT = {
    ht: {
      ready: "🎤 Tape bouton an oswa ekri kesyon ou",
      readyType: "✍️ Ekri kesyon ou anba a",
      listening: "🎤 Pwofesè a ap koute...",
      thinking: "🧠 Pwofesè a ap reflechi...",
      speaking: "👨🏽‍🏫 Pwofesè a ap reponn...",
      again: "🎤 Poze pwofesè a yon lòt kesyon",
      noSpeech: "Mwen pa tande kesyon an. Eseye ankò.",
      micDenied: "Fò w bay sit la pèmisyon pou mikwofòn nan.",
      micError: "Pwoblèm mikwofòn. Eseye ankò.",
      noVoiceSupport:
        "Navigatè sa a pa ka koute vwa. Ekri kesyon ou anba a.",
      unavailable:
        "Pwofesè a pa disponib kounye a. Eseye ankò pita.",
      talk: "🎤 PALE AK PWOFESÈ A",
      listeningBtn: "🎤 AP KOUTE... (TAPE POU KANPE)",
      speakingBtn: "🔊 PWOFESÈ A AP PALE...",
      creoleNote:
        "An kreyòl, ekri kesyon ou: telefòn yo poko ka tande kreyòl.",
      placeholder: "Ekri kesyon ou pou pwofesè a..."
    },

    fr: {
      ready: "🎤 Touchez le bouton ou écrivez votre question",
      readyType: "✍️ Écrivez votre question ci-dessous",
      listening: "🎤 Le professeur écoute...",
      thinking: "🧠 Le professeur réfléchit...",
      speaking: "👨🏽‍🏫 Le professeur répond...",
      again: "🎤 Posez une autre question",
      noSpeech: "Je n’ai pas entendu de question. Réessayez.",
      micDenied: "Autorisez le microphone pour ce site.",
      micError: "Erreur du microphone. Réessayez.",
      noVoiceSupport:
        "Ce navigateur ne peut pas écouter. Écrivez votre question ci-dessous.",
      unavailable:
        "Le professeur n’est pas disponible pour le moment.",
      talk: "🎤 PARLER AU PROFESSEUR",
      listeningBtn: "🎤 ÉCOUTE... (TOUCHER POUR ARRÊTER)",
      speakingBtn: "🔊 LE PROFESSEUR PARLE...",
      creoleNote: "",
      placeholder: "Écrivez votre question au professeur..."
    },

    en: {
      ready: "🎤 Tap the button or type your question",
      readyType: "✍️ Type your question below",
      listening: "🎤 The professor is listening...",
      thinking: "🧠 The professor is thinking...",
      speaking: "👨🏽‍🏫 The professor is answering...",
      again: "🎤 Ask the professor another question",
      noSpeech: "I did not hear a question. Try again.",
      micDenied: "Please allow microphone access for this site.",
      micError: "Microphone error. Try again.",
      noVoiceSupport:
        "This browser can’t listen. Type your question below.",
      unavailable:
        "The professor is temporarily unavailable.",
      talk: "🎤 TALK TO THE PROFESSOR",
      listeningBtn: "🎤 LISTENING... (TAP TO STOP)",
      speakingBtn: "🔊 PROFESSOR SPEAKING...",
      creoleNote: "",
      placeholder: "Type your question for the professor..."
    }
  };


  function siteLang() {
    let lang = "ht";

    try {
      lang =
        localStorage.getItem("bss1815-language") ||
        document.documentElement.lang ||
        "ht";
    } catch (e) {}

    return TEXT[lang] ? lang : "ht";
  }


  function t(key) {
    return TEXT[siteLang()][key];
  }


  /* =========================================================
     STATUS
     ========================================================= */

  function setProfessorStatus(message) {
    if (profStatus) {
      profStatus.textContent = message;
    }
  }


  function showAnswerText(text) {
    if (!answerBox) {
      return;
    }

    answerBox.textContent = text;
    answerBox.hidden = !text;
  }


  /* =========================================================
     SPEECH RECOGNITION
     ========================================================= */

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  function canListen() {
    return !!SpeechRecognition && siteLang() !== "ht";
  }


  if (SpeechRecognition) {

    BSS_PROF_AI.recognition = new SpeechRecognition();

    BSS_PROF_AI.recognition.continuous = false;
    BSS_PROF_AI.recognition.interimResults = false;
    BSS_PROF_AI.recognition.maxAlternatives = 1;


    BSS_PROF_AI.recognition.onstart = () => {

      BSS_PROF_AI.listening = true;

      setProfessorStatus(t("listening"));

      if (talkButton) {
        talkButton.classList.add("listening");
        talkButton.textContent = t("listeningBtn");
      }
    };


    BSS_PROF_AI.recognition.onresult = async (event) => {

      const question =
        event.results[0][0].transcript.trim();

      if (!question) {
        resetProfessorButton();
        return;
      }

      await askProfessor(question);
    };


    BSS_PROF_AI.recognition.onerror = (event) => {

      console.error(
        "Speech Recognition Error:",
        event.error
      );

      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {

        setProfessorStatus(t("micDenied"));

      } else if (event.error === "no-speech") {

        setProfessorStatus(t("noSpeech"));

      } else if (event.error !== "aborted") {

        setProfessorStatus(t("micError"));
      }

      resetProfessorButton();
    };


    BSS_PROF_AI.recognition.onend = () => {

      BSS_PROF_AI.listening = false;

      if (!BSS_PROF_AI.busy) {
        resetProfessorButton();
      }
    };
  }


  /* =========================================================
     START LISTENING
     ========================================================= */

  function startProfessorConversation() {

    if (BSS_PROF_AI.busy) {
      return;
    }


    /*
       Si intro video a t ap jwe ak son,
       kanpe li anvan mikwofòn nan kòmanse.
    */

    if (profVideo && !profVideo.paused) {
      profVideo.pause();
    }


    if (!canListen()) {

      setProfessorStatus(
        siteLang() === "ht"
          ? t("creoleNote")
          : t("noVoiceSupport")
      );

      if (askInput) {
        askInput.focus();
      }

      return;
    }


    if (
      BSS_PROF_AI.synth &&
      BSS_PROF_AI.synth.speaking
    ) {
      BSS_PROF_AI.synth.cancel();
    }


    if (BSS_PROF_AI.listening) {

      BSS_PROF_AI.recognition.stop();
      return;
    }


    try {

      BSS_PROF_AI.recognition.lang =
        VOICE_LANG[siteLang()];

      BSS_PROF_AI.recognition.start();

    } catch (error) {

      console.error(
        "Microphone start error:",
        error
      );

      resetProfessorButton();
    }
  }


  /* =========================================================
     SEND QUESTION TO GEMINI
     ========================================================= */

  async function askProfessor(question) {

    BSS_PROF_AI.busy = true;

    showAnswerText("");

    setProfessorStatus(t("thinking"));

    if (talkButton) {
      talkButton.disabled = true;
    }


    /*
       Pa kite ansyen intro video a pale
       pandan Gemini ap prepare repons lan.
    */

    if (profVideo) {
      profVideo.pause();
      profVideo.muted = true;
    }


    if (BSS_PROF_AI.synth) {
      BSS_PROF_AI.synth.cancel();
    }


    try {

      const response =
        await fetch(
          BSS_PROF_AI.endpoint,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              question: question,
              lang: siteLang()
            })
          }
        );


      const data =
        await response
          .json()
          .catch(() => ({}));


      if (
        !response.ok ||
        !data.answer
      ) {

        console.error(
          "PROFESSOR API RESPONSE:",
          response.status,
          data
        );

        throw new Error(
          data?.error ||
          "Professor API error: " +
          response.status
        );
      }


      /*
         Montre nouvo repons Gemini sou ekran.
      */

      showAnswerText(data.answer);


      /*
         Pale nouvo repons lan.
      */

      speakProfessorAnswer(
        data.answer,
        data.language ||
        VOICE_LANG[siteLang()]
      );


    } catch (error) {

      console.error(
        "PROFESSOR AI ERROR:",
        error
      );

      setProfessorStatus(
        t("unavailable")
      );

      BSS_PROF_AI.busy = false;

      resetProfessorButton();
    }
  }


  /* =========================================================
     INTRO VIDEO
     PLAY VIDEO = VIDEO ORIJINAL + SON ORIJINAL
     ========================================================= */

  function playProfessorIntroVideo() {

    if (!profVideo) {
      return;
    }


    /*
       Kanpe vwa AI si li t ap pale.
    */

    if (BSS_PROF_AI.synth) {
      BSS_PROF_AI.synth.cancel();
    }


    /*
       Intro video a gen dwa pale.
    */

    profVideo.muted = false;
    profVideo.volume = 1;
    profVideo.loop = false;


    try {
      profVideo.currentTime = 0;
    } catch (e) {}


    profVideo
      .play()
      .catch((error) => {

        console.error(
          "Professor intro video error:",
          error
        );
      });
  }


  /* =========================================================
     AI AVATAR VIDEO
     GEMINI RESPONSE = VIDEO MUTE
     ========================================================= */

  function startVideo() {

    if (!profVideo) {
      return;
    }


    /*
       ENPÒTAN:
       Pandan Gemini ap pale,
       son ansyen intro video a PA dwe jwe.
       Se speechSynthesis ki bay nouvo repons lan.
    */

    profVideo.muted = true;
    profVideo.volume = 1;
    profVideo.loop = true;


    try {
      profVideo.currentTime = 0;
    } catch (e) {}


    profVideo
      .play()
      .catch(() => {});
  }


  function stopVideo() {

    if (!profVideo) {
      return;
    }

    profVideo.pause();

    profVideo.loop = false;


    try {
      profVideo.currentTime = 0;
    } catch (e) {}
  }


  /* =========================================================
     FINISH AI ANSWER
     ========================================================= */

  function finishAnswer() {

    stopVideo();

    BSS_PROF_AI.busy = false;

    setProfessorStatus(
      t("again")
    );

    resetProfessorButton();
  }


  /* =========================================================
     PROFESSOR AI VOICE
     ========================================================= */

  function findVoice(language) {

    if (!BSS_PROF_AI.synth) {
      return null;
    }


    const voices =
      BSS_PROF_AI.synth.getVoices();


    const want =
      String(language || "")
        .toLowerCase();


    return (
      voices.find(
        (voice) =>
          voice.lang.toLowerCase() === want
      ) ||

      voices.find(
        (voice) =>
          voice.lang
            .toLowerCase()
            .startsWith(
              want.substring(0, 2)
            )
      ) ||

      null
    );
  }


  function speakProfessorAnswer(
    answer,
    language
  ) {

    const selectedLanguage =
      language ||
      VOICE_LANG[siteLang()];


    /*
       Repons Gemini toujou parèt sou ekran.
    */

    showAnswerText(answer);


    /*
       Kreyòl:
       si aparèy la pa gen vwa HT,
       nou montre repons lan an tèks.
    */

    const voice =
      findVoice(selectedLanguage);


    if (
      !BSS_PROF_AI.synth ||
      !voice ||
      selectedLanguage
        .toLowerCase()
        .startsWith("ht")
    ) {

      setProfessorStatus(
        t("speaking")
      );

      startVideo();


      const readTime =
        Math.min(
          20000,
          Math.max(
            4000,
            answer.length * 60
          )
        );


      setTimeout(
        finishAnswer,
        readTime
      );

      return;
    }


    /*
       ENPÒTAN:
       Nou pa itilize son ki anrejistre
       nan video a pou repons Gemini.
    */

    BSS_PROF_AI.synth.cancel();


    const sentences =
      answer.match(
        /[^.!?…]+[.!?…]*/g
      ) || [answer];


    let index = 0;


    setProfessorStatus(
      t("speaking")
    );


    /*
       Fè avatar la bouje,
       men kenbe video li MUTE.
    */

    startVideo();


    if (talkButton) {

      talkButton.disabled = true;

      talkButton.textContent =
        t("speakingBtn");
    }


    function speakNext() {

      if (
        index >=
        sentences.length
      ) {

        finishAnswer();
        return;
      }


      const part =
        sentences[index++]
          .trim();


      if (!part) {

        speakNext();
        return;
      }


      const speech =
        new SpeechSynthesisUtterance(
          part
        );


      speech.lang =
        selectedLanguage;

      speech.voice =
        voice;

      speech.rate =
        0.92;

      speech.pitch =
        1;

      speech.volume =
        1;


      speech.onend =
        speakNext;


      speech.onerror =
        (error) => {

          console.error(
            "Professor voice error:",
            error
          );

          showAnswerText(
            answer
          );

          finishAnswer();
        };


      BSS_PROF_AI.synth.speak(
        speech
      );
    }


    speakNext();
  }


  /* =========================================================
     RESET BUTTON
     ========================================================= */

  function resetProfessorButton() {

    BSS_PROF_AI.listening =
      false;


    if (askInput) {

      askInput.placeholder =
        t("placeholder");
    }


    if (!talkButton) {
      return;
    }


    talkButton.disabled =
      BSS_PROF_AI.busy;


    talkButton.classList.remove(
      "listening"
    );


    talkButton.textContent =
      t("talk");
  }


  /* =========================================================
     TALK BUTTON
     ========================================================= */

  if (talkButton) {

    talkButton.addEventListener(
      "click",
      startProfessorConversation
    );
  }


  /* =========================================================
     QUESTION FORM
     ========================================================= */

  if (
    askForm &&
    askInput
  ) {

    askForm.addEventListener(
      "submit",
      (event) => {

        event.preventDefault();


        const question =
          askInput.value.trim();


        if (
          !question ||
          BSS_PROF_AI.busy
        ) {
          return;
        }


        if (
          BSS_PROF_AI.listening &&
          BSS_PROF_AI.recognition
        ) {

          BSS_PROF_AI.recognition.stop();
        }


        askInput.value = "";


        askProfessor(
          question
        );
      }
    );
  }


  /* =========================================================
     CONNECT EXISTING PLAY VIDEO BUTTON
     ========================================================= */

  const professorSection =
    profVideo
      ? profVideo.closest("section")
      : null;


  if (professorSection) {

    const buttons =
      professorSection.querySelectorAll(
        "button"
      );


    buttons.forEach(
      (button) => {

        const buttonText =
          button.textContent
            .trim()
            .toUpperCase();


        /*
           Nou pa manyen TALK TO PROFESSOR.
           Nou konekte sèlman PLAY VIDEO.
        */

        if (
          buttonText.includes(
            "PLAY VIDEO"
          )
        ) {

          button.addEventListener(
            "click",
            (event) => {

              event.preventDefault();

              playProfessorIntroVideo();
            }
          );
        }


        /*
           RESTART VIDEO
        */

        if (
          buttonText.includes(
            "RESTART"
          )
        ) {

          button.addEventListener(
            "click",
            (event) => {

              event.preventDefault();

              playProfessorIntroVideo();
            }
          );
        }
      }
    );
  }


  /* =========================================================
     LANGUAGE BUTTONS
     ========================================================= */

  document
    .querySelectorAll(
      ".lang-btn[data-lang]"
    )
    .forEach(
      (btn) => {

        btn.addEventListener(
          "click",
          () => {

            setTimeout(
              () => {

                if (
                  !BSS_PROF_AI.busy
                ) {

                  resetProfessorButton();

                  setProfessorStatus(
                    canListen()
                      ? t("ready")
                      : t("readyType")
                  );
                }
              },
              50
            );
          }
        );
      }
    );


  /* =========================================================
     SPEECH SYNTHESIS VOICES
     ========================================================= */

  if (
    "speechSynthesis" in window
  ) {

    window.speechSynthesis.onvoiceschanged =
      () => {

        window.speechSynthesis.getVoices();
      };


    window.speechSynthesis.getVoices();
  }


  /* =========================================================
     VIDEO ENDED
     ========================================================= */

  if (profVideo) {

    profVideo.addEventListener(
      "ended",
      () => {

        profVideo.loop = false;
      }
    );
  }


  /* =========================================================
     READY
     ========================================================= */

  resetProfessorButton();

  setProfessorStatus(
    canListen()
      ? t("ready")
      : t("readyType")
  );


  console.log(
    "BSS1815 PROF AVATAR AI READY"
  );

})();
