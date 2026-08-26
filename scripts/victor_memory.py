#!/usr/bin/env python3
import json, re, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
MEM=ROOT/'memory'
STOP={'the','a','an','is','are','to','of','and','or','in','on','for','me','my','ka','ki','ke','ko','hai','he','kya','aur','or','se','ye','vo','main','mujhe'}

def tokens(s): return {x for x in re.findall(r'[a-zA-Z0-9_]+',s.lower()) if len(x)>1 and x not in STOP}
def load_records():
 out=[]
 fp=MEM/'founder_memory.json'
 if fp.exists():
  d=json.loads(fp.read_text()); out.append({'class':'founder','priority':100,'text':json.dumps(d,ensure_ascii=False),'data':d})
 for name,cls,p in [('decisions.jsonl','decision',90),('operational_memory.jsonl','operational',70)]:
  f=MEM/name
  if f.exists():
   for line in f.read_text().splitlines():
    if line.strip():
     d=json.loads(line); out.append({'class':cls,'priority':p,'text':json.dumps(d,ensure_ascii=False),'data':d})
 return out

def recall(query,limit=5):
 q=tokens(query); scored=[]
 for r in load_records():
  t=tokens(r['text']); overlap=len(q&t); score=overlap*10+r['priority']/100
  if overlap: scored.append((score,r))
 scored.sort(key=lambda x:x[0],reverse=True)
 return [r['data'] for _,r in scored[:limit]]

def main():
 if len(sys.argv)<3 or sys.argv[1]!='recall': raise SystemExit('usage: victor_memory.py recall <query>')
 print(json.dumps({'query':' '.join(sys.argv[2:]),'memories':recall(' '.join(sys.argv[2:]))},ensure_ascii=False,indent=2))
if __name__=='__main__': main()
