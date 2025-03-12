"use client";  // Mark this as a Client Component
import { useState } from "react";
import { TextField, Button, Container, Typography, List, ListItem, ListItemText } from "@mui/material";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { role: "user", content: input };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      // Send the conversation to the backend
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await response.json();
      const botMessage = { role: "assistant", content: data.reply };
      setMessages([...updatedMessages, botMessage]);

      setInput("");
    }
  };

  return (
    <Container>
      <Typography variant="h3" gutterBottom>
        AI-Powered Patient Triage System
      </Typography>
      <List>
        {messages.map((msg, index) => (
          <ListItem key={index} style={{ textAlign: msg.role === "user" ? "right" : "left" }}>
            <ListItemText primary={msg.content} secondary={msg.role} />
          </ListItem>
        ))}
      </List>
      <TextField
        fullWidth
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
      />
      <Button variant="contained" onClick={handleSend} style={{ marginTop: "10px" }}>
        Send
      </Button>
    </Container>
  );
}