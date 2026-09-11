import { expect, it } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
function files(dir:string):string[]{return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(dir,e.name)):[join(dir,e.name)]);}
it('service credentials and database clients stay outside client components',()=>{
  for(const file of files('components').filter(f=>/\.tsx?$/.test(f))){
    const code=readFileSync(file,'utf8');
    if(!code.startsWith('"use client"'))continue;
    expect(code,file).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY|from ["']@\/lib\/supabase\/server/);
    const serviceImports=code.split('\n').filter(l=>l.includes('from "@/lib/digital-checkup/service"'));
    serviceImports.forEach(l=>expect(l,file).toMatch(/^import type /));
  }
});
it('built browser chunks contain no privileged key variable or concrete secret',()=>{
  if(!existsSync('.next/static/chunks'))return;
  for(const file of files('.next/static/chunks').filter(f=>f.endsWith('.js'))){
    const code=readFileSync(file,'utf8');expect(code.includes('SUPABASE_SERVICE_ROLE_KEY'),file).toBe(false);
    if(process.env.SUPABASE_SERVICE_ROLE_KEY)expect(code.includes(process.env.SUPABASE_SERVICE_ROLE_KEY),file).toBe(false);
  }
});
