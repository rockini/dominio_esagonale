"""Assembla dist/dominio-esagonale.html: una pagina unica con tutto il codice e gli sprite inclusi."""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = ROOT + '/src/'
ORDER = [
    'sprites.js', 'units.js', 'core.js', 'map.js', 'mapgen.js', 'scenarios.js', 'armies.js',
    'engine/scn_rules.js', 'engine/state.js', 'engine/move.js', 'engine/combat.js', 'engine/magic.js', 'engine/turn.js', 'engine/setup.js',
    'ai/ai.js',
    'render_map.js', 'counters.js', 'ui/app.js', 'ui/anim.js', 'ui/hud.js', 'ui/panel.js', 'ui/menu.js',
]
js = '\n'.join(open(S + f, encoding='utf-8').read() for f in ORDER)
html = '''<!DOCTYPE html>
<html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Dominio Esagonale · Ordine e Caos</title>
<style>html,body{margin:0;height:100%;overflow:hidden;background:#2b1d12}canvas{display:block;touch-action:none}</style>
</head><body><canvas id="c"></canvas>
<script>
''' + js + '''
</script></body></html>'''
os.makedirs(ROOT + '/dist', exist_ok=True)
open(ROOT + '/dist/dominio-esagonale.html', 'w', encoding='utf-8').write(html)
print('dist/dominio-esagonale.html', len(html) // 1024, 'KB')
