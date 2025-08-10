const readline = require("readline");
const https = require("https");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter your email: ", (email) => {
  rl.question("Enter your cookie: ", (cookie) => {
    const url = `https://token.cursorpro.com.cn/reftoken?token=${cookie}`;

    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const response = JSON.parse(data);
            if (response.code === 0) {
              const { accessToken, refreshToken } = response.data;
              updateDatabase(email, accessToken, refreshToken);
            } else {
              console.error("Error fetching token:", response.msg);
            }
          } catch (error) {
            console.error("Error parsing response:", error.message);
          }
        });
      })
      .on("error", (err) => {
        console.error("Error with the request:", err.message);
      });

    rl.close();
  });
});

function updateDatabase(email, accessToken, refreshToken) {
  const dbPath = process.env.DB_PATH;

  if (!dbPath) {
    console.error("DB_PATH not found in .env file.");
    return;
  }

  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      return console.error("Error opening database:", err.message);
    }
    console.log("Connected to the SQLite database.");
  });

  db.serialize(() => {
    const updateEmailQuery = `UPDATE ItemTable SET value = ? WHERE key = 'cursorAuth/cachedEmail'`;
    db.run(updateEmailQuery, [email], function (err) {
      if (err) {
        return console.error("Error updating email:", err.message);
      }
      console.log(`Email updated successfully.`);
    });

    const updateAccessTokenQuery = `UPDATE ItemTable SET value = ? WHERE key = 'cursorAuth/accessToken'`;
    db.run(updateAccessTokenQuery, [accessToken], function (err) {
      if (err) {
        return console.error("Error updating access token:", err.message);
      }
      console.log(`Access token updated successfully.`);
    });

    const updateRefreshTokenQuery = `UPDATE ItemTable SET value = ? WHERE key = 'cursorAuth/refreshToken'`;
    db.run(updateRefreshTokenQuery, [refreshToken], function (err) {
      if (err) {
        return console.error("Error updating refresh token:", err.message);
      }
      console.log(`Refresh token updated successfully.`);
    });
  });

  db.close((err) => {
    if (err) {
      return console.error("Error closing database:", err.message);
    }
    console.log("Database connection closed.");
  });
}
