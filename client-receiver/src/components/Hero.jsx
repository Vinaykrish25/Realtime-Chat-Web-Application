import React, { useEffect, useState } from "react";
import "../../src/App.css";
import { Link, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";

const Hero = () => {
  const {socket} = useSocket();
  const navigate = useNavigate();

  const quotes = [
    "24/7 live chat and email support to resolve your queries anytime, anywhere.",
    "Personalized assistance from our dedicated support team to ensure a smooth experience.",
    "Fast and reliable solutions with a customer-first approach to every interaction.",
  ];

  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    if (index === quotes.length) return;
    if (subIndex === quotes[index].length + 1 && !deleting) {
      setTimeout(() => setDeleting(true), 1500);
      return;
    }
    if (subIndex === 0 && deleting) {
      setDeleting(false);
      setIndex((prev) => (prev + 1) % quotes.length);
      return;
    }
    const timeout = setTimeout(
      () => {
        setSubIndex((prev) => prev + (deleting ? -1 : 1));
      },
      deleting ? 40 : 70
    );
    return () => clearTimeout(timeout);
  }, [subIndex, index, deleting]);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearInterval(blinkInterval);
  }, []);

  const handleStart = () => {
    if(socket) {
      socket.emit("join-admin");
    }
    navigate('/admin-chat');
  }

  return (
    <section className="hero-container">
      <div className="hero-content">
        <div className="hero-heading-quotes">
          <h1>Welcome to Admin Panel 🤝</h1>
          <h3>{`${quotes[index].substring(0, subIndex)}${
            blink ? "|" : " "
          }`}</h3>
        </div>
        <div className="hero-description-button">
          <p>
            Click the button below to see the queries of customers and solve it 💬
          </p>
          <button onClick={handleStart}>Let's Solve 🚀</button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
