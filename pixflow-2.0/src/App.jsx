import { useState } from "react";

export default function App() {
  const [userinput, setUserInput] = useState("");
  const [loding, setLoading] = useState(false);
  const [items, setitems] = useState([]);
  const [error, seterror] = useState("");
  const [architectPlan, setArchitectPlan] = useState("");
   
   
async function Genarate() {
  setLoading(true);
  seterror("");
  setitems([]); // Purana data clear karne ke liye

  try {
    const Apikey = import.meta.env.VITE_GEMINI_KEY;

    // ==========================================
    // 🏛️ PHASE 1: ARCHITECT AGENT
    // ==========================================
let architectPrompt = `
You are a UX/UI Architect.

Create a website design blueprint for: "${userinput}"

Do NOT write HTML, CSS, JavaScript, or Tailwind.

First define MANDATORY GLOBAL RULES that every coding agent must follow:
- theme and visual style
- color palette
- typography
- buttons and cards
- border radius and shadows
- spacing
- animations

Then divide the website into logical sections.

For each section provide:
- id
- purpose
- layout
- key content/elements
- CTA if needed

All sections MUST follow the same Global Rules.
Do not create different themes for different sections.

Return ONLY valid JSON:

{
  "globalRules": {
    "theme": "",
    "colors": "",
    "typography": "",
    "components": "",
    "spacing": "",
    "animations": ""
  },
  "sections": [
    {
      "id": "header",
      "purpose": "",
      "layout": "",
      "elements": "",
      "cta": ""
    }
  ]
}

Return JSON only.
`;

    const resArchitect = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${Apikey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: architectPrompt }] }],
           generationConfig: {
        responseMimeType: "application/json",
      },
        }),
      }
    );

    if (!resArchitect.ok) throw new Error(`Architect API error: ${resArchitect.status}`);

    const dataArchitect = await resArchitect.json();
    const blueprint = dataArchitect.candidates[0].content.parts[0].text;
    
    console.log("--- 🏛️ ARCHITECT BLUEPRINT GENERATED ---", blueprint);
    setArchitectPlan(blueprint);

    // ==========================================
    // 💻 PHASE 2: CODER AGENT
    // ==========================================
let coderPrompt = `
You are a Senior Frontend Engineer.

Build a complete production-ready website from this design blueprint:

${blueprint}

Rules:
- Follow the Global Rules and section layout exactly.
- Keep the entire website visually consistent.
- Use Tailwind CSS.
- Build all planned sections in the correct order.
- Create responsive, modern, polished UI.
- Do not add explanations or markdown.

Return ONLY valid JSON:

{
  "title": "website title",
  "description": "short description",
  "html": "complete HTML code"
}
`;

    const resCoder = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${Apikey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: coderPrompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    if (!resCoder.ok) throw new Error(`Coder API error: ${resCoder.status}`);

    const dataCoder = await resCoder.json();
    let finalJsonText = dataCoder.candidates[0].content.parts[0].text;
    
    // Safety cleanup agar extra markdown aagya ho
    finalJsonText = finalJsonText.replace(/```json/g, "").replace(/```/g, "").trim();

  const jsonobject = JSON.parse(finalJsonText);

setitems(
  Array.isArray(jsonobject)
    ? jsonobject
    : [jsonobject]
);

console.log("--- 💻 CODER FINAL UI DEPLOYED ---", jsonobject);

  } catch (err) {
    console.log(err);
    seterror("Pipeline error! Design parse nahi ho paya, please try again.");
  }
  setLoading(false);
}

  const handleCopy = async (htmlCode) => {
    const fullHtml = `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-slate-900 text-white p-4">${htmlCode}</body></html>`;
    try {
      await navigator.clipboard.writeText(fullHtml);
      alert("Code copied successfully! 🔥");
    } catch (err) {
      alert("Failed to copy the code!");
    }
  };

  const handleDownload = (htmlCode, title) => {
    const fullHtml = `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-slate-900 text-white p-4">${htmlCode}</body></html>`;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || "design").toLowerCase().replace(/\s+/g, "-")}-design.html`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-screen bg-slate-900 font-sans text-slate-100 overflow-x-hidden">
      {/* Header */}
      <header className="w-full h-[80px] flex justify-between px-10 items-center border-b border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="text-[32px] font-extrabold text-indigo-400">pixflow</h1>
          <span className="text-xs bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-full">v2.0</span>
        </div>
        <a href="#" className="text-sm font-medium text-slate-400 hover:text-indigo-400 transition flex items-center gap-[3px]">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
            <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/>
          </svg>
          Settings
        </a>
      </header>

      {/* Input Section */}
      <section className="pt-[60px] pb-6">
        <div className="text-center mb-10 px-4">
          <h2 className="text-4xl font-extrabold text-indigo-400 tracking-tight sm:text-5xl mb-4">
            AI Web Design Generator
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Type your brand idea and watch Gemini craft tailored user experience structures instantly.
          </p>
          <div className="p-2 mt-8 rounded-2xl shadow-xl bg-slate-800/50 border border-slate-700 flex flex-col sm:flex-row gap-3 max-w-4xl mx-auto">
            <input 
              type="text" 
              value={userinput} 
              onChange={(e) => setUserInput(e.target.value)}  
              placeholder="e.g., Cyberpunk Gym, Minimalist Bakery, Organic Tea Shop..."  
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-indigo-500 transition text-base text-slate-100"
            />
            <button  
              onClick={Genarate}
              className="bg-indigo-600 hover:bg-indigo-700 font-semibold px-6 py-3 rounded-xl flex items-center justify-center min-w-[140px] transition shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              {loding ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Thinking...
                </span>
              ) : "Generate"}
            </button>
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="flex justify-center mx-auto max-w-4xl px-10 mb-6">
          <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-center text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Preview Grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 px-10 pb-12 max-w-7xl mx-auto gap-6">
          {items.map((item, index) => {
            return (
              <div key={index} className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col gap-3">  
                <h3 className="text-xl font-bold text-indigo-400 tracking-tight">{item.title || "Generated UI Component"}</h3>
                <p className="text-sm text-slate-400 mb-2 leading-relaxed">{item.description || "Tailwind CSS layout generated by Pixflow AI."}</p>
               
                <iframe 
                srcDoc={item.html} 
                title={item.title || "Generated UI Preview"}    
                className="w-full h-[500px] rounded-xl bg-slate-950 border border-slate-900 shadow-inner"></iframe>
                
                <div className="flex gap-4 mt-2">
                  <button 
                    onClick={() => handleCopy(item.html)} 
                    className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2.5 rounded-xl transition font-medium text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    📋 Copy Code
                  </button>
                  <button 
                    onClick={() => handleDownload(item.html, item.title)} 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 rounded-xl transition font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 cursor-pointer"
                  >
                    📥 Download HTML
                  </button>
                </div>
              </div>
            );
          })}
        </div> 
      )}
    </div>
  );
}
