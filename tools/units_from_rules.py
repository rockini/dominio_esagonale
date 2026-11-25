import json,re,os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
L=open(ROOT+'/docs/regole.md',encoding='utf-8').read().split('\n')
def table_after(head):
    i=next(k for k,l in enumerate(L) if l.startswith(head))
    while not L[i].startswith('|'): i+=1
    hdr=[c.strip() for c in L[i].strip('|').split('|')]; i+=2; rows=[]
    while i<len(L) and L[i].startswith('|'):
        rows.append(dict(zip(hdr,[c.strip() for c in L[i].strip('|').split('|')]))); i+=1
    return rows
U={}
def num(x): return int(x)
def add(r,fac,kind):
    name=r.get('Unità') or r.get('Eroe') or r.get('Boss')
    short=name.split(',')[0].replace('General ','').replace('Fratello ','').replace('Lady ','')
    if kind=='hero': short=short.split(' ')[0]
    short={'Capitano (Ordine)':'Capitano','Capobanda (Caos)':'Capobanda'}.get(short,short)
    cost=r['Costo']; costs=[None if c.strip() in('—','-') else int(c) for c in cost.split('/')]
    u=dict(id=short,name=name,fac=fac,kind=kind,V=num(r['V']),F=num(r['F']),D=num(r['D']),P=num(r['P']),R=num(r['R']),FM=num(r['FM']),
           cost=costs[0],costs=costs,vet=r.get('Vet'),kw=[k.strip() for k in r['Parole chiave'].split(',') if k.strip()],ab=r.get('Abilità',''))
    U[short]=u
for r in table_after('### 3.2'): add(r,'O','unit')
for r in table_after('## 4.'): add(r,'C','unit')
g=table_after('### 5.3'); add(g[0],'O','hero'); add(g[1],'C','hero')
for r in table_after('### 5.4'): add(r,'O','hero')
for r in table_after('### 5.5'): add(r,'C','hero')
for r in table_after('### 5.6'): add(r,'O' if r['Fazione']=='Ordine' else 'C','boss')
open(ROOT+'/src/units.js','w',encoding='utf-8').write('const UNITS='+json.dumps(U,ensure_ascii=False)+';\n')
print(len(U)); print([k for k in U])
