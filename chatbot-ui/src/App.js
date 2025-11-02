import React, { useState, useRef } from "react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("llama3.1"); // default model
  const [isTyping, setIsTyping] = useState(false);
  const chatAreaRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:8080/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, model }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let partial = "";

      // Add an initial "typing..." message
      setMessages((prev) => [...prev, { role: "bot", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        partial += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "bot", content: partial };
          return copy;
        });

        // auto scroll
        if (chatAreaRef.current) {
          chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "❌ There was an error. Try again later." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.chatWindow}>
        {/* Header with logo and model selector */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <img src="/bot-icon.png" alt="Bot" style={styles.icon} />
            <span style={styles.headerText}>Chatllama</span>
          </div>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={styles.modelSelect}
            disabled={isTyping}
          >
            <option value="llama3.1">llama3.1</option>
            <option value="deepseek-r1:8b">deepseek-r1:8b</option>
          </select>
        </div>

        {/* Chat messages */}
        <div style={styles.chatArea} ref={chatAreaRef}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                ...styles.message,
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                backgroundColor: msg.role === "user" ? "#4f93ff" : "#333",
                color: msg.role === "user" ? "#fff" : "#ddd",
              }}
            >
              {msg.content}
            </div>
          ))}
        </div>

        {/* Input area */}
        <div style={styles.inputArea}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            style={styles.input}
            disabled={isTyping}
          />
          <button onClick={sendMessage} style={styles.button} disabled={isTyping}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: "#121212",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
  },
  chatWindow: {
    width: "440px",
    height: "640px",
    backgroundColor: "#1b1b1b",
    borderRadius: "14px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#242424",
    padding: "10px 16px",
    borderBottom: "1px solid #333",
  },
  headerLeft: { display: "flex", alignItems: "center" },
  icon: { width: "34px", height: "34px", borderRadius: "50%", marginRight: "10px" },
  headerText: { fontSize: "1.1rem", fontWeight: "bold", color: "#ddd" },
  modelSelect: {
    backgroundColor: "#2e2e2e",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: "8px",
    padding: "6px 8px",
    outline: "none",
    cursor: "pointer",
  },
  chatArea: { flex: 1, display: "flex", flexDirection: "column", padding: "12px", overflowY: "auto" },
  message: { padding: "10px 14px", borderRadius: "18px", margin: "6px 0", maxWidth: "80%", wordBreak: "break-word", lineHeight: "1.4" },
  inputArea: { display: "flex", borderTop: "1px solid #333", backgroundColor: "#242424", padding: "10px" },
  input: { flex: 1, backgroundColor: "#1a1a1a", color: "#fff", border: "1px solid #444", borderRadius: "6px", padding: "8px", marginRight: "8px" },
  button: { backgroundColor: "#4f93ff", color: "#fff", border: "none", borderRadius: "6px", padding: "8px 16px", cursor: "pointer" },
};
