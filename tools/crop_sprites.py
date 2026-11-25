import sys, json, base64, io
from PIL import Image, ImageDraw
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
U=ROOT+'/assets/'
OUT=None
S=176
def card(img, x0, y0, pitch, c, r):
    x=x0+c*pitch; y=y0+r*pitch
    box=(round(x+3), round(y+3), round(x+pitch-3), round(y+pitch-3))
    return img.crop(box).resize((S,S), Image.LANCZOS)
sprites={}
def put(name, im, q=48):
    im=im.convert('RGBA')
    p=im.quantize(colors=q, method=Image.Quantize.FASTOCTREE)
    b=io.BytesIO(); p.save(b,'PNG',optimize=True)
    sprites[name]='data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
caos=Image.open(U+'pedine-caos.png').convert('RGB')
names=[['Orchi guerrieri','Orchi berseker','Goblin','Goblin arcieri','Goblin genieri','Troll'],
['Troll di montagna','Ogre','Lupi giganti','Chimere minori','Scheletri','Zombie'],
['Spettri','Guerrieri del Caos','Cavalieri del Caos','Campioni mutati','Draghi giovani','Demoni minori'],
['Stregoni del Caos','Sciamani','Mutanti','Abomini','Sciami di insetti corrotti']]
for r,row in enumerate(names):
    for c,n in enumerate(row): put(n, card(caos,91,57,382.2,c,r))
eo=Image.open(U+'pedine-eroi.png').convert('RGB')
for c,n in enumerate(['Kael','Lyria','Theron','Seris']): put(n, card(eo,91,57,382,c,0))
ec=Image.open(U+'pedine-eroi-caos.png').convert('RGB')
for c,n in enumerate(['Gorath','Veyla','Korgash','Zhara']): put(n, card(ec,91,57,382,c,0))
bo=Image.open(U+'pedine-boss.png').convert('RGB')
for i,n in enumerate(['Arcimago del Concilio','Gran Maestro dei Cavalieri','Re-Sacerdote','Drago Antico','Signore del Caos','Demone Maggiore','Stregone Supremo del Caos']):
    put(n, card(bo,91,57,382,i%4,i//4))
def icons(f, names):
    im=Image.open(U+f).convert('RGBA')
    for i,n in enumerate(names):
        cx=271+(i%5)*464; cy=271+(i//5)*473; R=218
        sq=im.crop((cx-R,cy-R,cx+R,cy+R)).resize((140,140),Image.LANCZOS)
        m=Image.new('L',(560,560),0); ImageDraw.Draw(m).ellipse((4,4,556,556),fill=255)
        sq.putalpha(m.resize((140,140),Image.LANCZOS))
        put('M:'+n, sq, 32)
icons('magie-ordine.png',['Barriera di Luce','Purga del Caos','Giuramento di Ferro','Luce Guaritrice','Sigillo di Immobilità','Aura di Disciplina','Colonna di Fuoco','Purificazione del Terreno','Scudo di Fede','Chiamata all\'Ordine'])
icons('magie-caos.png',['Vampata Mutante','Sussurro della Fenditura','Piaga Strisciante','Furia Bestiale','Tentacoli della Corruzione','Urlo del Vuoto','Dono Mutante','Pioggia di Cenere Nera','Risveglio Demoniaco','Frattura della Realtà'])
open(ROOT+'/src/sprites.js','w').write('const SPRITES='+json.dumps(sprites,ensure_ascii=False)+';\n')
print(len(sprites), sum(len(v) for v in sprites.values())//1024,'KB')
