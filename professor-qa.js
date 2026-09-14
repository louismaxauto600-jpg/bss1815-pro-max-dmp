// ============================================
// PROFESSOR-QA.JS
// Chat senp: elèv tape kesyon, Gemini reponn an tèks
// Etap 1 (san videyo avata a toujou) — nou ajoute videyo apre sa mache
// ============================================

const GEMINI_API_KEY = "AQ.Ab8RN6KBB-sJlVuUGq3llvBcLuIXIR_BW39LybDlcnFOW_a44A";
const GEMINI_MODEL = "gemini-3.6-flash";

const questionInput = document.getElementById('professorQuestion');
const askBtn = document.getElementById('professorAskBtn');
const answerBox = document.getElementById('professorAnswer');

// Kontèks pou Gemini konnen ki wòl li jwe
const SYSTEM_CONTEXT = "Ou se yon pwofesè k ap ede elèv yo nan yon lekòl imobilye ak asirans ki rele BSS1815. Reponn kesyon yo klè, senp, an kreyòl ayisyen (sof si elèv la poze kesyon an nan yon lòt lang), ak yon ton pwofesyonèl men amikal.";

askBtn.addEventListener('click', async function () {
  const question = questionInput.value.trim();

  if (!question) {
    answerBox.textContent = "Tanpri ekri yon kesyon anvan.";
    return;
  }

  askBtn.disabled = true;
  askBtn.textContent = "Ap reflechi...";
  answerBox.textContent = "";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: SYSTEM_CONTEXT + "\n\nKesyon elèv la: " + question }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      answerBox.textContent = "Erè: " + data.error.message;
    } else {
      const answer = data.candidates[0].content.parts[0].text;
      answerBox.textContent = answer;
    }

  } catch (error) {
    answerBox.textContent = "Pa gen koneksyon. Eseye ankò.";
  } finally {
    askBtn.disabled = false;
    askBtn.textContent = "Poze kesyon";
  }
});

