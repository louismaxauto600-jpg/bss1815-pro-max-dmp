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

    // Fonksyon Netlify: netlify/functions/professor.js
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
     LANG SIT LA (KRE / FRA / ENG)
     ========================================================= */

  const VOICE_LANG = { ht: "ht-HT", fr: "fr-FR", en: "en-US", es: "es-ES" };

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
      noVoiceSupport: "Navigatè sa a pa ka koute vwa. Ekri kesyon ou anba a.",
      unavailable: "Pwofesè a pa disponib kounye a. Eseye ankò pita.",
      talk: "🎤 PALE AK PWOFESÈ A",
      listeningBtn: "🎤 AP KOUTE... (TAPE POU KANPE)",
      speakingBtn: "🔊 PWOFESÈ A AP PALE...",
      creoleNote: "An kreyòl, ekri kesyon ou: telefòn yo poko ka tande kreyòl.",
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
      noVoiceSupport: "Ce navigateur ne peut pas écouter. Écrivez votre question ci-dessous.",
      unavailable: "Le professeur n’est pas disponible pour le moment.",
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
      noVoiceSupport: "This browser can’t listen. Type your question below.",
      unavailable: "The professor is temporarily unavailable.",
      talk: "🎤 TALK TO THE PROFESSOR",
      listeningBtn: "🎤 LISTENING... (TAP TO STOP)",
      speakingBtn: "🔊 PROFESSOR SPEAKING...",
      creoleNote: "",
      placeholder: "Type your question for the professor..."
    }
  };

  function siteLang() {
    let lang = "ht";
    try { lang = localStorage.getItem("bss1815-language") || document.documentElement.lang || "ht"; } catch (e) {}
    return TEXT[lang] ? lang : "ht";
  }

  function t(key) { return TEXT[siteLang()][key]; }


  /* =========================================================
     STATUS
     ========================================================= */

  function setProfessorStatus(message) {
    if (profStatus) { profStatus.textContent = message; }
  }

  function showAnswerText(text) {
    if (!answerBox) { return; }
    answerBox.textContent = text;
    answerBox.hidden = !text;
  }


  /* =========================================================
     SPEECH RECOGNITION
     (kreyòl pa sipòte: vizitè a ekri pito)
     ========================================================= */

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

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
      const question = event.results[0][0].transcript.trim();
      if (!question) { resetProfessorButton(); return; }
      await askProfessor(question);
    };

    BSS_PROF_AI.recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setProfessorStatus(t("micDenied"));
      } else if (event.error === "no-speech") {
        setProfessorStatus(t("noSpeech"));
      } else if (event.error !== "aborted") {
        setProfessorStatus(t("micError"));
      }
      resetProfessorButton();
    };

    /* Korije: bouton an pa rete bloke sou "LISTENING" */
    BSS_PROF_AI.recognition.onend = () => {
      BSS_PROF_AI.listening = false;
      if (!BSS_PROF_AI.busy) { resetProfessorButton(); }
    };
  }


  /* =========================================================
     START LISTENING
     ========================================================= */

  function startProfessorConversation() {

    if (BSS_PROF_AI.busy) { return; }

    if (!canListen()) {
      setProfessorStatus(siteLang() === "ht" ? t("creoleNote") : t("noVoiceSupport"));
      if (askInput) { askInput.focus(); }
      return;
    }

    if (BSS_PROF_AI.synth && BSS_PROF_AI.synth.speaking) {
      BSS_PROF_AI.synth.cancel();
    }

    if (BSS_PROF_AI.listening) {
      BSS_PROF_AI.recognition.stop();
      return;
    }

    try {
      BSS_PROF_AI.recognition.lang = VOICE_LANG[siteLang()];
      BSS_PROF_AI.recognition.start();
    } catch (error) {
      console.error("Microphone start error:", error);
      resetProfessorButton();
    }
  }


  /* =========================================================
     SEND QUESTION TO AI
     ========================================================= */

  async function askProfessor(question) {

    BSS_PROF_AI.busy = true;
    showAnswerText("");
    setProfessorStatus(t("thinking"));
    if (talkButton) { talkButton.disabled = true; }

    try {
      const response = await fetch(BSS_PROF_AI.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question, lang: siteLang() })
      });

      const data = await response.json().catch(() => ({}));

      if (!data.answer) {
        throw new Error("Professor API error: " + response.status);
      }

      speakProfessorAnswer(data.answer, data.language || VOICE_LANG[siteLang()]);

    } catch (error) {
      console.error("PROFESSOR AI ERROR:", error);
      setProfessorStatus(t("unavailable"));
      BSS_PROF_AI.busy = false;
      resetProfessorButton();
    }
  }


  /* =========================================================
     PROFESSOR VOICE
     - kreyòl: repons lan parèt an tèks (pa gen vwa kreyòl)
     - lòt lang: vwa, divize an fraz pou Chrome pa koupe l
     ========================================================= */

  function findVoice(language) {
    if (!BSS_PROF_AI.synth) { return null; }
    const voices = BSS_PROF_AI.synth.getVoices();
    const want = language.toLowerCase();
    return (
      voices.find((v) => v.lang.toLowerCase() === want) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(want.substring(0, 2))) ||
      null
    );
  }

  function startVideo() {
    if (!profVideo) { return; }
    try { profVideo.currentTime = 0; } catch (e) {}
    profVideo.muted = true;
    profVideo.loop = true;
    profVideo.play().catch(() => {});
  }

  function stopVideo() {
    if (!profVideo) { return; }
    profVideo.pause();
    profVideo.loop = false;
    try { profVideo.currentTime = 0; } catch (e) {}
  }

  function finishAnswer() {
    stopVideo();
    BSS_PROF_AI.busy = false;
    setProfessorStatus(t("again"));
    resetProfessorButton();
  }

  function speakProfessorAnswer(answer, language) {

    const voice = findVoice(language);

    /* Pa gen vwa pou lang sa a (kreyòl): montre tèks la */
    if (!BSS_PROF_AI.synth || !voice || language.toLowerCase().startsWith("ht")) {
      showAnswerText(answer);
      setProfessorStatus(t("speaking"));
      startVideo();
      const readTime = Math.min(20000, Math.max(4000, answer.length * 60));
      setTimeout(finishAnswer, readTime);
      return;
    }

    BSS_PROF_AI.synth.cancel();

    const sentences = answer.match(/[^.!?…]+[.!?…]*/g) || [answer];
    let index = 0;

    setProfessorStatus(t("speaking"));
    startVideo();
    if (talkButton) {
      talkButton.disabled = true;
      talkButton.textContent = t("speakingBtn");
    }

    function speakNext() {
      if (index >= sentences.length) { finishAnswer(); return; }
      const part = sentences[index++].trim();
      if (!part) { speakNext(); return; }

      const speech = new SpeechSynthesisUtterance(part);
      speech.lang = language;
      speech.voice = voice;
      speech.rate = 0.92;
      speech.pitch = 1;
      speech.volume = 1;
      speech.onend = speakNext;
      speech.onerror = () => {
        showAnswerText(answer);
        finishAnswer();
      };
      BSS_PROF_AI.synth.speak(speech);
    }

    speakNext();
  }


  /* =========================================================
     RESET BUTTON
     ========================================================= */

  function resetProfessorButton() {
    BSS_PROF_AI.listening = false;
    if (askInput) { askInput.placeholder = t("placeholder"); }
    if (!talkButton) { return; }
    talkButton.disabled = BSS_PROF_AI.busy;
    talkButton.classList.remove("listening");
    talkButton.textContent = t("talk");
  }


  /* =========================================================
     BOUTON AK FÒM EKRI A
     ========================================================= */

  if (talkButton) {
    talkButton.addEventListener("click", startProfessorConversation);
  }

  if (askForm && askInput) {
    askForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const question = askInput.value.trim();
      if (!question || BSS_PROF_AI.busy) { return; }
      if (BSS_PROF_AI.listening && BSS_PROF_AI.recognition) { BSS_PROF_AI.recognition.stop(); }
      askInput.value = "";
      askProfessor(question);
    });
  }

  /* Lè vizitè a chanje lang, mete tèks yo ajou */
  document.querySelectorAll(".lang-btn[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setTimeout(() => {
        if (!BSS_PROF_AI.busy) {
          resetProfessorButton();
          setProfessorStatus(canListen() ? t("ready") : t("readyType"));
        }
      }, 50);
    });
  });


  /* =========================================================
     VOICES
     ========================================================= */

  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.getVoices(); };
    window.speechSynthesis.getVoices();
  }


  /* =========================================================
     READY
     ========================================================= */

  resetProfessorButton();
  setProfessorStatus(canListen() ? t("ready") : t("readyType"));
  console.log("BSS1815 PROF AVATAR AI READY");

})();
