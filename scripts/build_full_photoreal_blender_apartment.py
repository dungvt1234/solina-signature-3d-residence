import bpy
import math
import os

def create_photoreal_apartment():
    print(">>> 1. Initializing Clean Scene...")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene

    base_dir = r"C:\Users\DELL\antigravity\Solina-Signature-B.11.17-—-3D-POV-Residence"
    export_path = os.path.join(base_dir, "public", "models", "apartment.glb")

    # Mapping: Three.js coordinates (X, Y_up, Z) -> Blender coordinates (bx, by, bz):
    # bx = X
    # by = -Z (so glTF_Z = -by = Z)
    # bz = Y_up (height)
    def pos(x, z, y_up=0.0):
        return (x, -z, y_up)

    # 1. PBR MATERIAL BUILDER
    def pbr(name, color=(1, 1, 1, 1), roughness=0.5, metallic=0.0, clearcoat=0.0, transmission=0.0, ior=1.45):
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            if "Base Color" in bsdf.inputs: bsdf.inputs["Base Color"].default_value = color
            if "Roughness" in bsdf.inputs: bsdf.inputs["Roughness"].default_value = roughness
            if "Metallic" in bsdf.inputs: bsdf.inputs["Metallic"].default_value = metallic
            if "Coat Weight" in bsdf.inputs: bsdf.inputs["Coat Weight"].default_value = clearcoat
            elif "Clearcoat" in bsdf.inputs: bsdf.inputs["Clearcoat"].default_value = clearcoat
            if "Transmission Weight" in bsdf.inputs: bsdf.inputs["Transmission Weight"].default_value = transmission
            elif "Transmission" in bsdf.inputs: bsdf.inputs["Transmission"].default_value = transmission
            if "IOR" in bsdf.inputs: bsdf.inputs["IOR"].default_value = ior
        return mat

    # Materials according to BEACON spec
    m_plaster     = pbr("M_Dulux_PlasterWall", color=(0.95, 0.94, 0.92, 1.0), roughness=0.82)
    m_porcelain   = pbr("M_Viglacera_Porcelain", color=(0.98, 0.98, 0.99, 1.0), roughness=0.08, clearcoat=1.0)
    m_laminate    = pbr("M_Laminate_Oak_Floor", color=(0.76, 0.56, 0.38, 1.0), roughness=0.62)
    m_slats       = pbr("M_Fluted_Wood_Slats", color=(0.72, 0.49, 0.28, 1.0), roughness=0.45)
    m_quartz      = pbr("M_Hafele_Quartz_Stone", color=(0.95, 0.94, 0.93, 1.0), roughness=0.04, clearcoat=1.0)
    m_skirting    = pbr("M_Skirting_White_Trim", color=(0.98, 0.97, 0.96, 1.0), roughness=0.22)
    m_sofa        = pbr("M_Luxury_Cream_Fabric", color=(0.91, 0.88, 0.82, 1.0), roughness=0.92)
    m_teal        = pbr("M_Teal_Accent_Fabric", color=(0.20, 0.42, 0.52, 1.0), roughness=0.82)
    m_linen       = pbr("M_Crisp_Bed_Linen", color=(0.95, 0.93, 0.90, 1.0), roughness=0.88)
    m_rug         = pbr("M_Coastal_Woven_Rug", color=(0.88, 0.85, 0.78, 1.0), roughness=0.96)
    m_rattan      = pbr("M_Resort_Rattan_Weave", color=(0.68, 0.52, 0.35, 1.0), roughness=0.82)
    m_brass       = pbr("M_Brushed_Brass", color=(0.95, 0.78, 0.42, 1.0), roughness=0.22, metallic=0.95)
    m_chrome      = pbr("M_Grohe_Chrome", color=(0.95, 0.95, 0.95, 1.0), roughness=0.05, metallic=1.0)
    m_glass       = pbr("M_Tempered_Glass_Railing", color=(0.95, 0.98, 1.0, 0.2), roughness=0.02, transmission=0.88, ior=1.52)
    m_xingfa      = pbr("M_Xingfa_Black_Alu", color=(0.12, 0.12, 0.13, 1.0), roughness=0.35, metallic=0.7)
    m_tv          = pbr("M_OLED_Screen", color=(0.02, 0.02, 0.03, 1.0), roughness=0.08, clearcoat=0.95)
    m_ac          = pbr("M_Daikin_AC_Unit", color=(0.96, 0.96, 0.96, 1.0), roughness=0.28)
    m_ceramic_san = pbr("M_Grohe_White_Ceramic", color=(0.98, 0.98, 0.98, 1.0), roughness=0.12, clearcoat=0.9)
    m_pot         = pbr("M_Terracotta_Pot", color=(0.88, 0.84, 0.80, 1.0), roughness=0.45)
    m_leaf        = pbr("M_Tropical_Palm_Leaf", color=(0.16, 0.46, 0.22, 1.0), roughness=0.42)
    m_mirror      = pbr("M_Inox_Bathroom_Mirror", color=(0.98, 0.98, 0.98, 1.0), roughness=0.02, metallic=1.0)

    # Scanned grass turf PBR material
    m_grass = bpy.data.materials.new(name="M_Balcony_Lawn_Grass_PBR")
    m_grass.use_nodes = True
    gnodes = m_grass.node_tree.nodes
    glinks = m_grass.node_tree.links
    gbsdf = gnodes.get("Principled BSDF")
    if gbsdf:
        if "Roughness" in gbsdf.inputs: gbsdf.inputs["Roughness"].default_value = 0.90
        color_path = os.path.join(base_dir, "public", "textures", "grass", "grass_color.jpg")
        nor_path = os.path.join(base_dir, "public", "textures", "grass", "grass_nor.jpg")
        if os.path.exists(color_path):
            img_n = gnodes.new("ShaderNodeTexImage")
            img_n.image = bpy.data.images.load(color_path)
            glinks.new(img_n.outputs["Color"], gbsdf.inputs["Base Color"])
        if os.path.exists(nor_path):
            nor_n = gnodes.new("ShaderNodeTexImage")
            nor_n.image = bpy.data.images.load(nor_path)
            nor_n.image.colorspace_settings.name = 'Non-Color'
            nor_map = gnodes.new("ShaderNodeNormalMap")
            nor_map.inputs["Strength"].default_value = 0.85
            glinks.new(nor_n.outputs["Color"], nor_map.inputs["Color"])
            if "Normal" in gbsdf.inputs: glinks.new(nor_map.outputs["Normal"], gbsdf.inputs["Normal"])

    # 2. FLOOR PLAN SLABS
    print(">>> 2. Creating Floor Slabs...")
    # Living, Hallway, Kitchen, Bathrooms (Viglacera Porcelain)
    bpy.ops.mesh.primitive_plane_add(size=1, location=pos(0, 0.71, 0.004))
    fl_main = bpy.context.active_object
    fl_main.name = "Floor_Main_Porcelain"
    fl_main.scale = (12.24, 5.82, 1)
    fl_main.data.materials.append(m_porcelain)

    # Master Bedroom Laminate Floor (BEACON spec)
    bpy.ops.mesh.primitive_plane_add(size=1, location=pos(-4.27, -0.525, 0.008))
    fl_mbed = bpy.context.active_object
    fl_mbed.name = "Floor_Master_Laminate"
    fl_mbed.scale = (3.70, 3.35, 1)
    fl_mbed.data.materials.append(m_laminate)

    # Bedroom 2 Laminate Floor (BEACON spec)
    bpy.ops.mesh.primitive_plane_add(size=1, location=pos(-0.635, -0.525, 0.008))
    fl_bed2 = bpy.context.active_object
    fl_bed2.name = "Floor_Bedroom2_Laminate"
    fl_bed2.scale = (3.57, 3.35, 1)
    fl_bed2.data.materials.append(m_laminate)

    # Balcony Lush Green Grass Lawn Turf
    bpy.ops.mesh.primitive_plane_add(size=1, location=pos(0, -2.98, 0.010))
    fl_balc = bpy.context.active_object
    fl_balc.name = "Floor_Balcony_GrassTurf"
    fl_balc.scale = (12.30, 1.56, 1)
    fl_balc.data.materials.append(m_grass)

    # 3. WALLS & PARTITIONS
    print(">>> 3. Creating Walls & Partitions...")
    WALL_HEIGHT = 2.95
    wall_defs = [
        # Boundary walls
        {"x1": -6.12, "z1": 3.62, "x2": 4.95, "z2": 3.62, "th": 0.16, "mat": m_plaster, "name": "Wall_South_1"},
        {"x1": 5.90, "z1": 3.62, "x2": 6.12, "z2": 3.62, "th": 0.16, "mat": m_plaster, "name": "Wall_South_2"},
        {"x1": 6.12, "z1": -2.20, "x2": 6.12, "z2": 3.62, "th": 0.16, "mat": m_plaster, "name": "Wall_East"},
        {"x1": -6.12, "z1": -1.50, "x2": -6.12, "z2": 3.62, "th": 0.16, "mat": m_plaster, "name": "Wall_West"},
        # Master bath
        {"x1": -6.12, "z1": 1.50, "x2": -3.38, "z2": 1.50, "th": 0.14, "mat": m_plaster, "name": "Wall_MasterBath_North"},
        {"x1": -2.55, "z1": 1.50, "x2": -2.55, "z2": 3.62, "th": 0.14, "mat": m_plaster, "name": "Wall_MasterBath_East"},
        {"x1": -2.42, "z1": -2.20, "x2": -2.42, "z2": 0.58, "th": 0.18, "mat": m_plaster, "name": "Wall_Master_East"},
        # Common bath
        {"x1": -2.35, "z1": 1.50, "x2": -1.58, "z2": 1.50, "th": 0.12, "mat": m_plaster, "name": "Wall_CommonBath_North"},
        {"x1": -0.78, "z1": 1.50, "x2": -0.78, "z2": 3.62, "th": 0.14, "mat": m_plaster, "name": "Wall_CommonBath_East"},
        # Bedroom 2
        {"x1": -2.22, "z1": -2.20, "x2": -2.22, "z2": 1.15, "th": 0.14, "mat": m_plaster, "name": "Wall_Bed2_West"},
        {"x1": -2.22, "z1": 1.15, "x2": 0.42, "z2": 1.15, "th": 0.14, "mat": m_plaster, "name": "Wall_Bed2_North"},
        {"x1": 1.38, "z1": -2.20, "x2": 1.38, "z2": 1.15, "th": 0.18, "mat": m_plaster, "name": "Wall_Bed2_East"},
        # Balcony Glass Balustrade & Glazing
        {"x1": -2.95, "z1": -2.20, "x2": -2.42, "z2": -2.20, "th": 0.05, "mat": m_glass, "name": "Glazing_Master"},
        {"x1": -2.22, "z1": -2.20, "x2": -0.95, "z2": -2.20, "th": 0.05, "mat": m_glass, "name": "Glazing_Bed2_L"},
        {"x1": 0.85, "z1": -2.20, "x2": 1.38, "z2": -2.20, "th": 0.05, "mat": m_glass, "name": "Glazing_Bed2_R"},
        {"x1": 1.38, "z1": -2.20, "x2": 2.15, "z2": -2.20, "th": 0.05, "mat": m_glass, "name": "Glazing_Living_L"},
        {"x1": 4.95, "z1": -2.20, "x2": 6.12, "z2": -2.20, "th": 0.05, "mat": m_glass, "name": "Glazing_Living_R"},
        {"x1": 6.15, "z1": -3.76, "x2": 6.15, "z2": -2.20, "th": 0.03, "mat": m_glass, "name": "Railing_East"},
        {"x1": -4.05, "z1": -3.76, "x2": 6.15, "z2": -3.76, "th": 0.03, "mat": m_glass, "name": "Railing_North"},
    ]

    for w in wall_defs:
        dx = w["x2"] - w["x1"]
        dz = w["z2"] - w["z1"]
        length = math.hypot(dx, dz)
        angle = math.atan2(-dz, dx) # Note: by = -z
        mx = (w["x1"] + w["x2"]) / 2
        mz = (w["z1"] + w["z2"]) / 2
        h = 1.15 if "Railing" in w["name"] else WALL_HEIGHT

        bpy.ops.mesh.primitive_cube_add(size=1)
        wall_obj = bpy.context.active_object
        wall_obj.name = w["name"]
        wall_obj.scale = (length, w["th"], h)
        wall_obj.location = pos(mx, mz, h / 2)
        wall_obj.rotation_euler = (0, 0, angle)
        wall_obj.data.materials.append(w["mat"])

    # 4. SKIRTING BOARDS (Len chân tường trắng sứ)
    print(">>> 4. Creating Skirting Boards...")
    def add_skirt(x1, z1, x2, z2, name):
        dx = x2 - x1
        dz = z2 - z1
        length = math.hypot(dx, dz)
        angle = math.atan2(-dz, dx)
        bpy.ops.mesh.primitive_cube_add(size=1)
        obj = bpy.context.active_object
        obj.name = name
        obj.scale = (length, 0.012, 0.08)
        obj.location = pos((x1 + x2) / 2, (z1 + z2) / 2, 0.04)
        obj.rotation_euler = (0, 0, angle)
        obj.data.materials.append(m_skirting)

    add_skirt(-6.12, 3.60, 4.95, 3.60, "Skirting_South")
    add_skirt(6.10, -2.18, 6.10, 3.60, "Skirting_East")
    add_skirt(-2.40, -2.18, -2.40, 1.15, "Skirting_MBed_East")
    add_skirt(1.36, -2.18, 1.36, 1.15, "Skirting_Bed2_East")

    # 5. 98 FLUTED WOOD SLATS (TV Feature Wall)
    print(">>> 5. Creating 98 Wood Slats...")
    slat_count = 98
    wall_len = 5.10
    start_z = 1.05 - wall_len / 2 + 0.026
    for i in range(slat_count):
        z = start_z + (i / (slat_count - 1)) * (wall_len - 0.052)
        bpy.ops.mesh.primitive_cube_add(size=1)
        slat = bpy.context.active_object
        slat.name = f"WoodSlat_{i+1:02d}"
        slat.scale = (0.032, 0.034, 2.70)
        slat.location = pos(5.98, z, 1.38)
        slat.data.materials.append(m_slats)

    # 6. HIGH-END FURNITURE & INTERIOR
    print(">>> 6. Adding High-End Furniture...")
    # Living Room - Curved Sectional Sofa with Cushions
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos(3.80, -0.45, 0.22))
    sofa_base = bpy.context.active_object
    sofa_base.name = "Sofa_Base"
    sofa_base.scale = (2.60, 1.05, 0.44)
    sofa_base.data.materials.append(m_sofa)

    bpy.ops.mesh.primitive_cube_add(size=1, location=pos(3.80, -0.05, 0.55))
    sofa_back = bpy.context.active_object
    sofa_back.name = "Sofa_Backrest"
    sofa_back.scale = (2.60, 0.32, 0.65)
    sofa_back.data.materials.append(m_sofa)

    bpy.ops.mesh.primitive_cube_add(size=1, location=pos(2.85, -0.22, 0.52))
    pillow1 = bpy.context.active_object
    pillow1.name = "Sofa_Pillow_1"
    pillow1.scale = (0.42, 0.22, 0.42)
    pillow1.rotation_euler = (0.2, 0.1, 0.3)
    pillow1.data.materials.append(m_teal)

    bpy.ops.mesh.primitive_cube_add(size=1, location=pos(4.75, -0.22, 0.52))
    pillow2 = bpy.context.active_object
    pillow2.name = "Sofa_Pillow_2"
    pillow2.scale = (0.42, 0.22, 0.42)
    pillow2.rotation_euler = (0.2, -0.1, -0.3)
    pillow2.data.materials.append(m_teal)

    # Coffee Table (Round Marble/Quartz Top + Brass Base)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.48, depth=0.36, location=pos(3.80, -1.05, 0.18))
    table = bpy.context.active_object
    table.name = "Table_Coffee_Round"
    table.data.materials.append(m_quartz)

    # Coastal Rug
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos(3.80, -0.65, 0.012))
    rug = bpy.context.active_object
    rug.name = "Living_Rug"
    rug.scale = (3.40, 2.60, 0.015)
    rug.data.materials.append(m_rug)

    # 75" OLED Wall TV & Floating Console
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos(5.88, 0.55, 1.45))
    tv = bpy.context.active_object
    tv.name = "TV_75Inch_OLED"
    tv.scale = (0.05, 1.68, 0.96)
    tv.data.materials.append(m_tv)

    bpy.ops.mesh.primitive_cube_add(size=1, location=pos(5.78, 0.55, 0.42))
    console = bpy.context.active_object
    console.name = "TV_Floating_Console"
    console.scale = (0.35, 2.40, 0.32)
    console.data.materials.append(m_slats)

    # Kitchen Cabinets & Hafele Quartz Countertop
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos(1.98, 3.22, 0.45))
    k_base = bpy.context.active_object
    k_base.name = "Kitchen_Cabinets"
    k_base.scale = (4.45, 0.65, 0.88)
    k_base.data.materials.append(m_slats)

    bpy.ops.mesh.primitive_cube_add(size=1, location=pos(1.98, 3.22, 0.91))
    k_top = bpy.context.active_object
    k_top.name = "Kitchen_Quartz_Countertop"
    k_top.scale = (4.55, 0.72, 0.04)
    k_top.data.materials.append(m_quartz)

    # Kitchen Island & Quartz Top
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos(1.98, 2.28, 0.45))
    island = bpy.context.active_object
    island.name = "Island_Cabinets"
    island.scale = (1.60, 0.90, 0.88)
    island.data.materials.append(m_slats)

    bpy.ops.mesh.primitive_cube_add(size=1, location=pos(1.98, 2.28, 0.91))
    island_top = bpy.context.active_object
    island_top.name = "Island_Quartz_Top"
    island_top.scale = (1.70, 0.98, 0.04)
    island_top.data.materials.append(m_quartz)

    # Dining Table (6-seater)
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos(3.65, 1.85, 0.74))
    dining = bpy.context.active_object
    dining.name = "Dining_Table"
    dining.scale = (1.80, 0.92, 0.05)
    dining.data.materials.append(m_slats)

    # Master King Bed with Fluted Slats Headboard
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos(-4.35, -0.45, 0.28))
    m_bed = bpy.context.active_object
    m_bed.name = "Bed_Master_King"
    m_bed.scale = (2.05, 2.15, 0.55)
    m_bed.data.materials.append(m_linen)

    bpy.ops.mesh.primitive_cube_add(size=1, location=pos(-4.35, 0.68, 0.75))
    m_headboard = bpy.context.active_object
    m_headboard.name = "Headboard_Master_Slats"
    m_headboard.scale = (2.85, 0.12, 1.40)
    m_headboard.data.materials.append(m_slats)

    # Bedroom 2 Bed
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos(-0.65, -0.45, 0.26))
    bed2 = bpy.context.active_object
    bed2.name = "Bed_Bedroom2_Queen"
    bed2.scale = (1.75, 2.05, 0.52)
    bed2.data.materials.append(m_linen)

    # Master Bath Luxury Soaking Tub & Grohe Fixtures
    bpy.ops.mesh.primitive_cylinder_add(radius=0.45, depth=0.55, location=pos(-5.50, 2.60, 0.28))
    tub = bpy.context.active_object
    tub.name = "Bathtub_Master"
    tub.scale = (1.8, 0.9, 1.0)
    tub.data.materials.append(m_ceramic_san)

    bpy.ops.mesh.primitive_cube_add(size=1, location=pos(-2.85, 3.05, 0.45))
    m_vanity = bpy.context.active_object
    m_vanity.name = "Vanity_Master"
    m_vanity.scale = (0.55, 1.20, 0.85)
    m_vanity.data.materials.append(m_quartz)

    bpy.ops.mesh.primitive_cube_add(size=1, location=pos(-2.85, 3.55, 1.55))
    m_mirror_mesh = bpy.context.active_object
    m_mirror_mesh.name = "Mirror_Master"
    m_mirror_mesh.scale = (0.04, 1.10, 0.90)
    m_mirror_mesh.data.materials.append(m_mirror)

    # Common Bath Vanity & Mirror
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos(-1.08, 3.05, 0.45))
    c_vanity = bpy.context.active_object
    c_vanity.name = "Vanity_Common"
    c_vanity.scale = (0.52, 1.10, 0.85)
    c_vanity.data.materials.append(m_quartz)

    # Daikin AC Units with Linear Grilles
    def add_ac(x, z, name):
        bpy.ops.mesh.primitive_cube_add(size=1, location=pos(x, z, 2.90))
        ac = bpy.context.active_object
        ac.name = name
        ac.scale = (0.88, 0.28, 0.06)
        ac.data.materials.append(m_ac)

    add_ac(3.85, -0.80, "AC_Daikin_Living_1")
    add_ac(5.20, -0.80, "AC_Daikin_Living_2")

    # Balcony Rattan Lounge Chairs & Table
    bpy.ops.mesh.primitive_cylinder_add(radius=0.42, depth=0.72, location=pos(-0.55, -3.05, 0.36))
    rattan1 = bpy.context.active_object
    rattan1.name = "Rattan_Chair_1"
    rattan1.data.materials.append(m_rattan)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.42, depth=0.72, location=pos(0.65, -3.05, 0.36))
    rattan2 = bpy.context.active_object
    rattan2.name = "Rattan_Chair_2"
    rattan2.data.materials.append(m_rattan)

    # Tropical Resort Plants in Living & Balcony
    def add_palm(x, z):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.18, depth=0.45, location=pos(x, z, 0.22))
        pot = bpy.context.active_object
        pot.name = "Pot"
        pot.data.materials.append(m_pot)

        bpy.ops.mesh.primitive_cone_add(radius1=0.45, depth=0.95, location=pos(x, z, 0.75))
        foliage = bpy.context.active_object
        foliage.name = "Palm_Foliage"
        foliage.data.materials.append(m_leaf)

    add_palm(-5.05, -2.95)
    add_palm(1.85, -3.35)
    add_palm(5.55, -3.15)
    add_palm(2.05, 0.72)

    # 7. EXPORT GLB
    print(f">>> 7. Exporting to {export_path}...")
    bpy.ops.export_scene.gltf(
        filepath=export_path,
        export_format='GLB',
        use_selection=False,
        export_apply=True,
        export_yup=True
    )
    print(">>> GLB EXPORT COMPLETED SUCCESSFULLY!")

create_photoreal_apartment()
