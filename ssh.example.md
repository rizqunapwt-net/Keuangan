# SSH / GitHub reference (NO SECRETS)

github_repo: https://github.com/<org>/<repo>.git

ssh_command: ssh -o ProxyCommand="cloudflared access ssh --hostname <hostname>" <user>@<hostname>

notes:
- Jangan simpan token/password di file markdown.
- Simpan secret di password manager / vault.
- Jika secret pernah terpampang di chat/commit, anggap bocor dan rotasi segera.
