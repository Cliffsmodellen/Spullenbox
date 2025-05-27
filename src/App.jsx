import React, { useState, useEffect } from "react";

function App() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isIdentified, setIsIdentified] = useState(false);
  const [mode, setMode] = useState(null);
  const [tools, setTools] = useState([]);
  const [toolName, setToolName] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    const savedEmail = localStorage.getItem("userEmail");
    const savedTools = localStorage.getItem("tools");

    if (savedName && savedEmail) {
      setUserName(savedName);
      setUserEmail(savedEmail);
      setIsIdentified(true);
    }

    if (savedTools) {
      try {
        setTools(JSON.parse(savedTools));
      } catch (e) {
        console.error("Fout bij laden tools uit localStorage:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tools", JSON.stringify(tools));
  }, [tools]);

  const handleIdentify = () => {
    if (userName.trim() && userEmail.trim()) {
      localStorage.setItem("userName", userName);
      localStorage.setItem("userEmail", userEmail);
      setIsIdentified(true);
    }
  };

  const addTool = () => {
    if (toolName && category) {
      setTools([
        ...tools,
        {
          name: toolName,
          category,
          owner: userName,
          ownerEmail: userEmail,
          borrowedBy: null,
        },
      ]);
      setToolName("");
      setCategory("");
    }
  };

  const borrowTool = (index) => {
    const updatedTools = [...tools];
    if (!updatedTools[index].borrowedBy) {
      updatedTools[index].borrowedBy = userName;
      setTools(updatedTools);
    }
  };

  const getGroupedTools = () => {
    const grouped = {};
    tools.forEach((tool, index) => {
      if (!grouped[tool.category]) grouped[tool.category] = [];
      grouped[tool.category].push({ ...tool, originalIndex: index });
    });
    for (const category in grouped) {
      grouped[category].sort((a, b) =>
        a.name.localeCompare(b.name, "nl", { sensitivity: "base" })
      );
    }
    return grouped;
  };

  const categoryColors = {
    "knippen/snijden": "#007BFF", // blauw
    boren: "#28A745",             // groen
    schuren: "#FF9800",           // oranje
    lijmen: "#9C27B0",            // paars
    "verven/maskeren": "#E91E63", // roze
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "auto" }}>
      <h1>ToolShare Club</h1>

      {!isIdentified && (
        <div style={{ marginBottom: "2rem" }}>
          <h2>Wie ben je?</h2>
          <input
            type="text"
            placeholder="Naam"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={{ marginRight: "1rem" }}
          />
          <input
            type="email"
            placeholder="E-mail"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            style={{ marginRight: "1rem" }}
          />
          <button onClick={handleIdentify}>Bevestig</button>
        </div>
      )}

      {isIdentified && !mode && (
        <div style={{ marginBottom: "2rem" }}>
          <h2>Welkom, {userName}!</h2>
          <p>Wat wil je doen?</p>
          <button onClick={() => setMode("add")} style={{ marginRight: "1rem" }}>
            ➕ Gereedschap toevoegen
          </button>
          <button onClick={() => setMode("borrow")}>🔄 Iets lenen</button>
        </div>
      )}

      {mode === "add" && (
        <div style={{ marginBottom: "2rem" }}>
          <h2>➕ Gereedschap toevoegen</h2>
          <input
            type="text"
            placeholder="Naam gereedschap"
            value={toolName}
            onChange={(e) => setToolName(e.target.value)}
            style={{ marginRight: "1rem" }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ marginRight: "1rem" }}
          >
            <option value="">Categorie</option>
            <option value="knippen/snijden">Knippen/snijden</option>
            <option value="boren">Boren</option>
            <option value="schuren">Schuren</option>
            <option value="lijmen">Lijmen</option>
            <option value="verven/maskeren">Verven/maskeren</option>
          </select>
          <button onClick={addTool}>Toevoegen</button>
          <br />
          <br />
          <button onClick={() => setMode(null)}>⬅ Terug</button>
        </div>
      )}

      {mode === "borrow" && (
        <div>
          <h2>🔄 Gereedschap lenen</h2>
          {tools.length === 0 ? (
            <p>Er is nog geen gereedschap beschikbaar.</p>
          ) : (
            Object.entries(getGroupedTools()).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: "2rem" }}>
                <h3 style={{ color: categoryColors[cat] || "black" }}>{cat}</h3>
                {items.map((tool) => (
                  <div
                    key={tool.originalIndex}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0.5rem 0",
                      borderBottom: "1px solid #ddd",
                      fontSize: "0.95rem",
                    }}
                  >
                    <div style={{ flex: 1 }}>{tool.name}</div>
                    <div style={{ flex: 1 }}>
                      {tool.owner} ({tool.ownerEmail})
                    </div>
                    <div style={{ flex: 1 }}>
                      {tool.borrowedBy ? (
                        <span style={{ color: "red" }}>Geleend door: {tool.borrowedBy}</span>
                      ) : (
                        <button onClick={() => borrowTool(tool.originalIndex)}>Lenen</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
          <br />
          <button onClick={() => setMode(null)}>⬅ Terug</button>
        </div>
      )}
    </div>
  );
}

export default App;
