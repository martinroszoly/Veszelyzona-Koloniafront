import numpy as np,json
from pathlib import Path
P=Path(__file__).resolve().parent/'floor_samples';meta=json.load(open(P/'manifest.json'));report={}
for kind,info in meta.items():
 vertices=np.fromfile(P/(kind+'_vertices.bin'),'<f4').reshape(-1,3);bones=np.fromfile(P/(kind+'_bones.bin'),'<i4').reshape(len(vertices),-1);weights=np.fromfile(P/(kind+'_weights.bin'),'<f4').reshape(len(vertices),-1);N=len(vertices);co=np.c_[vertices,np.ones(N,dtype='f4')];report[kind]={}
 # Floor only needs the Y row. Combine the actual Godot skin matrices at every 60fps key.
 for name,frames in info['clips'].items():
  matrices=np.fromfile(P/(kind+'_'+name+'.bin'),'<f4').reshape(frames,info['binds'],3,4);lowest=999;final=None
  for frame,m in enumerate(matrices):
   y=np.zeros(N,dtype='f4')
   for influence in range(bones.shape[1]):
    r=m[bones[:,influence],1,:];y+=np.einsum('ij,ij->i',r,co)*weights[:,influence]
   minimum=float(y.min());lowest=min(lowest,minimum)
   if frame==frames-1:final=minimum
  report[kind][name]={'min_y_m':lowest,'last_frame_min_y_m':final,'sampled_poses':frames,'vertices':N};print(kind,name,lowest,flush=True)
json.dump(report,open(P.parent/'Godot_4.7_floor.json','w'),indent=2)
assert all(c['min_y_m']>=-.0001 for u in report.values()for c in u.values()),'Floor penetration'
