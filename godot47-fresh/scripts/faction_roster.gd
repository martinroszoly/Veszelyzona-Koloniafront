class_name FactionRoster
extends RefCounted

## A négy referencia-frakció közös, adatvezérelt egységlistája.
## A látványassetek később egységenként erre a kulcsra kötődnek.

const FACTIONS := {
	"ember": {
		"display_name": "EMBER",
		"accent": Color("2d78c5"),
		"trim": Color("c3a987"),
		"doctrine": "Rugalmas, felszerelés-alapú emberi haderő",
		"units": ["infantry", "carrier", "tank", "helicopter", "fighter"],
	},
	"xenon": {
		"display_name": "XENON",
		"accent": Color("d31527"),
		"trim": Color("17171d"),
		"doctrine": "Gyors, agresszív biomechanikus támadás",
		"units": ["infantry", "carrier", "tank", "helicopter", "fighter"],
	},
	"roantok": {
		"display_name": "ROANTOK",
		"accent": Color("b67a30"),
		"trim": Color("33271e"),
		"doctrine": "Nehéz, ipari autonóm gépek",
		"units": ["infantry", "carrier", "tank", "helicopter", "fighter"],
	},
	"rovarok": {
		"display_name": "ROVAROK",
		"accent": Color("7e6a35"),
		"trim": Color("241d13"),
		"doctrine": "Raj-alapú organikus túlerő",
		"units": ["infantry", "carrier", "tank", "helicopter", "fighter"],
	},
}

const UNIT_LABELS := {
	"infantry": "Gyalogsági raj",
	"carrier": "Páncélozott szállító",
	"tank": "Tank / nehéz támogatás",
	"helicopter": "Légi támogató egység",
	"fighter": "Csapásmérő vadászegység",
}

const UNIT_PROFILES := {
	"infantry": {"cost": 120, "build_time": 8.0, "population": 3, "role": "területfoglalás"},
	"carrier": {"cost": 260, "build_time": 14.0, "population": 4, "role": "gyalogsági támogatás"},
	"tank": {"cost": 420, "build_time": 20.0, "population": 6, "role": "nehéz áttörés"},
	"helicopter": {"cost": 500, "build_time": 24.0, "population": 7, "role": "légi támogatás"},
	"fighter": {"cost": 650, "build_time": 28.0, "population": 8, "role": "légi fölény"},
}

static func get_faction(faction_id: String) -> Dictionary:
	return FACTIONS.get(faction_id, FACTIONS.ember)

static func get_unit_label(unit_id: String) -> String:
	return UNIT_LABELS.get(unit_id, unit_id)

static func get_unit_profile(unit_id: String) -> Dictionary:
	return UNIT_PROFILES.get(unit_id, UNIT_PROFILES["infantry"])

static func get_model_path(faction_id: String, unit_id: String) -> String:
	var asset_unit_id := "vehicle" if unit_id == "carrier" else unit_id
	return "res://assets/models/%s_%s.glb" % [faction_id, asset_unit_id]
