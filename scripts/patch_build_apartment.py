import re

file_path = r"C:\Users\DELL\antigravity\Solina-Signature-B.11.17-—-3D-POV-Residence\src\scene\buildApartment.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Marker 1: before Interior Marble Floor Slab
target_start = "  // Interior Marble Floor Slab (z from -2.2 to +3.65, x from -6.15 to +6.15, clipped curve top-left)"
replacement_start = """  // Interior procedural fallback group (replaced seamlessly when Blender GLB model loads)
  const interiorGroup = new THREE.Group();
  interiorGroup.name = 'Procedural_Apartment_Fallback';
  root.add(interiorGroup);

  // Load Photorealistic Blender-Exported glTF Model (apartment.glb)
  const gltfLoader = new GLTFLoader();
  const blenderModelGroup = new THREE.Group();
  blenderModelGroup.name = 'Blender_Apartment_GLB';
  root.add(blenderModelGroup);

  gltfLoader.load(
    './models/apartment.glb',
    (gltf) => {
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((m) => {
              if (m && 'envMapIntensity' in m) {
                (m as any).envMapIntensity = 1.0;
                m.needsUpdate = true;
              }
            });
          }
        }
      });
      blenderModelGroup.add(gltf.scene);
      // Once authentic Blender model is ready, hide procedural geometry to prevent overlap
      interiorGroup.visible = false;
      console.log('✅ [Blender 3D] Loaded authentic photorealistic apartment.glb successfully!');
    },
    undefined,
    (err) => {
      console.warn('⚠️ [Blender 3D] Could not load apartment.glb, keeping procedural fallback:', err);
    }
  );

  // Interior Marble Floor Slab (z from -2.2 to +3.65, x from -6.15 to +6.15, clipped curve top-left)"""

if target_start in content:
    content = content.replace(target_start, replacement_start, 1)
    print("Replaced start block successfully")
else:
    print("Could not find target_start")

# Now between the start marker and '// 5. Recessed Ceiling', replace 'root.add(' with 'interiorGroup.add('
start_idx = content.find("const interiorGroup = new THREE.Group();")
end_idx = content.find("// 5. Recessed Ceiling & Architectural Cove Downlights")

if start_idx != -1 and end_idx != -1:
    section = content[start_idx:end_idx]
    # Do NOT replace root.add(interiorGroup) or root.add(blenderModelGroup)
    # Only replace after gltfLoader block
    gltf_end_idx = section.find("// Interior Marble Floor Slab")
    before_interior = section[:gltf_end_idx]
    interior_body = section[gltf_end_idx:]
    
    modified_body = interior_body.replace("root.add(", "interiorGroup.add(")
    new_section = before_interior + modified_body
    content = content[:start_idx] + new_section + content[end_idx:]
    print("Replaced interior root.add with interiorGroup.add successfully")
else:
    print(f"Indices: start={start_idx}, end={end_idx}")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("buildApartment.ts updated successfully!")
