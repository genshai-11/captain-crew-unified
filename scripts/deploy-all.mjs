import { execFileSync } from 'node:child_process';

function run(args) {
  execFileSync('npm', args, { stdio: 'inherit', shell: true });
}

run(['run', 'smoke:workspace']);
run(['run', 'deploy:functions']);
run(['run', 'deploy:hosting']);
