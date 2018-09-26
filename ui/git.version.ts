import fs = require('fs');
import { Observable, combineLatest } from 'rxjs';

let exec = require('child_process').exec;

const revision = new Observable<string>(s => {
  exec('git rev-parse --short HEAD',
    function (error: Error, stdout: Buffer, stderr: Buffer) {
      if (error !== null) {
        console.log('git error: ' + error + stderr);
      }
      s.next(stdout.toString().trim());
      s.complete();
    });
});

const branch = new Observable<string>(s => {
  exec('git rev-parse --abbrev-ref HEAD',
    function (error: Error, stdout: Buffer, stderr: Buffer) {
      if (error !== null) {
        console.log('git error: ' + error + stderr);
      }
      s.next(stdout.toString().trim());
      s.complete();
    });
});

combineLatest(revision, branch)
  .subscribe(([revision, branch]) => {
    console.log(`version: '${process.env.npm_package_version}', revision: '${revision}', branch: '${branch}'`);

    const content = '// this file is automatically generated by git.version.ts script\n' +
      `export const versions = {version: '${process.env.npm_package_version}', revision: '${revision}', branch: '${branch}'};`;

    fs.writeFileSync(
      'src/environments/versions.ts',
      content,
      { encoding: 'utf8' }
    );
  });