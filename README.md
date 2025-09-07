# UBU Lite

Quick Smoke Test

Run the development server and then one of the demo scripts to exercise the API end-to-end.

1. Start the Django server (from project root):

```powershell
# Windows / PowerShell
python manage.py runserver
```

2. From Git Bash run the bash demo (note: Git Bash expands `!` in history by default; the script disables history expansion with `set +H`):

```bash
bash scripts/api_demo.sh
```

3. From PowerShell run the PowerShell demo:

```powershell
pwsh -File scripts/api_demo.ps1
# or in Windows PowerShell
powershell -File scripts/api_demo.ps1
```

Notes

- The scripts expect the server at http://127.0.0.1:8000 by default. Override with BASE_URL environment variable.
- The Authorization header used for protected endpoints is exactly:

    Authorization: Bearer <token>

- The bash script parses JSON using an embedded Python one-liner (no jq required).

Quick Start

1. Create and activate a virtualenv, then install deps:

```bash
python -m venv .venv; .venv/Scripts/Activate.ps1  # PowerShell
pip install -r requirements.txt
```

2. Migrate and run server:

```bash
python manage.py migrate
python manage.py runserver
```

3. JWT notes

- Authentication uses SimpleJWT. Obtain an access token via POST /api/auth/login/ and send protected requests with header:

    Authorization: Bearer <access>

4. Developer helpers

- Reset dev DB and migrations:

```bash
bash scripts/dev_reset.sh
```

- Run the demos (Git Bash or PowerShell):

```bash
bash scripts/api_demo.sh

# or PowerShell
pwsh -File scripts/api_demo.ps1
```
