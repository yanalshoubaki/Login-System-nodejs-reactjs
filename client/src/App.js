import "./App.css";
import React, { useState, useEffect } from "react";
import Axios from "axios";
function App() {
  Axios.defaults.withCredentials = true;

  const [usernameReg, setUsernameReg] = useState("");
  const [passwordReg, setPasswordReg] = useState("");

  const [usernameLog, setUsernameLog] = useState("");
  const [passwordLog, setPasswordLog] = useState("");

  const [loginStatus, setLoginStatus] = useState(false);

  const register = () => {
    Axios.post("http://localhost:3001/register", {
      username: usernameReg,
      password: passwordReg,
    }).then((response) => {});
  };

  const login = () => {
    Axios.post("http://localhost:3001/login", {
      username: usernameLog,
      password: passwordLog,
    }).then((response) => {
      if (!response.data.auth) {
        setLoginStatus(false);
      } else {
        localStorage.setItem("token", response.data.token);
        setLoginStatus(true);
      }
    });
  };

  const userAuthenticated = () => {
    Axios.get("http://localhost:3001/isUserAuth", {
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    }).then((response) => {
      console.log(response);
    });
  };

  return (
    <div className="App">
      <h1>Register</h1>
      <br />
      <div className="form">
        <div className="form-input">
          <label>Username</label>
          <input
            onChange={(e) => setUsernameReg(e.target.value)}
            type="text"
            name="username"
          />
        </div>
        <div className="form-input">
          <label>Password</label>
          <input
            onChange={(e) => setPasswordReg(e.target.value)}
            type="password"
            name="password"
          />
        </div>
        <button onClick={register}>Register</button>
      </div>
      <br />
      <h1>Login</h1>
      <br />
      <div className="form">
        <div className="form-input">
          <label>Username</label>
          <input
            onChange={(e) => setUsernameLog(e.target.value)}
            type="text"
            name="username"
          />
        </div>
        <div className="form-input">
          <label>Password</label>
          <input
            onChange={(e) => setPasswordLog(e.target.value)}
            type="password"
            name="password"
          />
        </div>
        <button onClick={login}>Login</button>
      </div>
      {loginStatus && (
        <button onClick={userAuthenticated}>Click to authenticated</button>
      )}
      ;
    </div>
  );
}

export default App;
