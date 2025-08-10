## CursorTokens

Small Node.js CLI that fetches access/refresh tokens from a remote API and writes them into Cursor's global SQLite state. It updates the following keys in `ItemTable`:

- `cursorAuth/cachedEmail`
- `cursorAuth/accessToken`
- `cursorAuth/refreshToken`

Use with care and only on your own machine. Make a backup of your Cursor state DB before running.

### Requirements

- Node.js 16+ (18+ recommended)
- npm
- Internet access (the script calls a remote HTTPS endpoint)

### Install

```bash
git clone <this-repo-url>
cd CursorTokens
npm install
```

### Configure

Create a `.env` file in the project root with the full path to your Cursor state SQLite database (`state.vscdb`). Typical locations:

- Windows: `C:\Users\<YourUserName>\AppData\Roaming\Cursor\User\globalStorage\state.vscdb`
- macOS: `/Users/<YourUserName>/Library/Application Support/Cursor/User/globalStorage/state.vscdb`
- Linux: `/home/<YourUserName>/.config/Cursor/User/globalStorage/state.vscdb`

Example for this machine (Windows):

```env
DB_PATH=C:\Users\YOUR_USERNAME\AppData\Roaming\Cursor\User\globalStorage\state.vscdb
```

Tip: Back up the DB first:

```powershell
Copy-Item "$env:APPDATA\Cursor\User\globalStorage\state.vscdb" "$env:APPDATA\Cursor\User\globalStorage\state.vscdb.bak"
```

### Run

Execute the CLI and follow the prompts:

```bash
node app.js
```

You will be asked for:

- Email: the email you want stored in Cursor's global state
- Cookie/Token: a value sent to `https://token.cursorpro.com.cn/reftoken?token=<value>` to retrieve tokens

On success, the script updates the SQLite DB and prints status messages.

### How it works

1. Prompts for email and a cookie/token via `readline`.
2. Sends `GET https://token.cursorpro.com.cn/reftoken?token=<cookie>` using Node's `https`.
3. Expects a JSON response like:

   ```json
   { "code": 0, "data": { "accessToken": "...", "refreshToken": "..." } }
   ```

4. Opens the SQLite DB at `DB_PATH` and runs `UPDATE` statements on `ItemTable` for the three keys listed above.

### Troubleshooting

- DB_PATH not found in .env file: Ensure `.env` exists and `DB_PATH` points to `state.vscdb`.
- Error opening database / permission issues: Close Cursor before running, or ensure you have file permissions. You can re-run after closing Cursor.
- Error fetching token: The remote service returned an error (check console output). Verify your cookie/token value and network connectivity.
- sqlite3 install issues: On some systems you may need build tools (e.g., Xcode CLT on macOS, or windows-build-tools). Reinstall with `npm rebuild sqlite3` if needed.

### Security notes

- The script writes tokens to your local Cursor state DB. Handle your token carefully and do not share it.
- This project is not affiliated with or endorsed by Cursor.

### License

ISC
