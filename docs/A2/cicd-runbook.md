# A2 Step 7 — CI/CD Pipeline Runbook (GitHub Actions → AWS EC2)

This pipeline automates **build → test → deploy** of both the backend (pm2) and
the frontend (nginx static host) to a single AWS EC2 instance on every push to
`main`. It directly addresses the A1 gap where the public endpoint was served by
a managed host instead of EC2.

## 7.1 Pipeline overview
Workflow: `.github/workflows/ci.yml`

- **Job `test`** (every push & PR): Node 20 → `npm ci` → `npm test` (44 unit tests). Deployment is blocked unless tests pass (`needs: test`).
- **Job `deploy`** (push to `main` only):
  1. Build the React app **in the GitHub runner** (the t2.micro lacks RAM to build React reliably).
  2. `scp` the `frontend/build` artifact to EC2.
  3. `ssh` to EC2: `git pull`, `npm ci --omit=dev`, (re)start backend with **pm2**, publish the frontend into `/var/www/restaurant-review`, reload **nginx**, and run a `/api/health` smoke check.

## 7.2 One-time EC2 setup
1. Launch Ubuntu 22.04 t2.micro; security group inbound: **22, 80** (and 5001 for direct API checks).
2. SSH in and clone the repo to `~/sampleapp_IFQ636`.
3. Create `backend/.env`:
   ```
   PORT=5001
   MONGO_URI=<your MongoDB Atlas URI>
   JWT_SECRET=<random secret>
   ```
4. Run `chmod +x scripts/ec2-setup.sh && ./scripts/ec2-setup.sh` (installs Node 20, pm2, nginx; starts the backend; installs the nginx site from `scripts/nginx/restaurant-review.conf`).
5. Run the `pm2 startup` command it prints so the backend survives reboot.

## 7.3 GitHub repository secrets
Settings → Secrets and variables → Actions:

| Secret | Value |
|---|---|
| `EC2_HOST` | EC2 public IP / DNS |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | private key matching the instance key pair |
| `PUBLIC_API_URL` | (optional) public API base; blank works since nginx proxies `/api` same-origin |

## 7.4 Verifying a successful run
- GitHub → **Actions**: `test` job green, then `deploy` job green (screenshot 7.x).
- On EC2: `pm2 status` shows `mesa-backend` **online** with uptime/restarts (screenshot 7.x).
- Browser: `http://<EC2_PUBLIC_IP>/` loads the React app; `http://<EC2_PUBLIC_IP>/api/health` returns `{"status":"OK"}` (screenshot 7.x).

## 7.5 Known constraint (declare in the report)
The shared student AWS account (`AWSReservedSSO_OES-LT5-Student`) restricts some
operations needed for *stable* public exposure: EC2 Instance Connect is denied for
the role, t2.micro has no serial console, and the Elastic IP quota is exhausted so
the public IP is not stable across restarts. The pipeline and scripts above are the
correct EC2 target architecture; if the account blocks a stable Elastic IP, either
(a) assign an Elastic IP once the quota is raised, or (b) keep the same workflow but
point `EC2_HOST` at a personal AWS account. The automated build/test stage runs on
every push regardless.
