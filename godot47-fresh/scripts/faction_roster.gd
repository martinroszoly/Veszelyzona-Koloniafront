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
		"units": ["infantry", "carrier"],
	},
	"mordra": {
		"display_name": "MORDRA",
		"accent": Color("7e6a35"),
		"trim": Color("241d13"),
		"doctrine": "Föld alól kitörő, peterakó kolónia és organikus rajháború",
		"units": ["infantry", "brute"],
	},
}

const UNIT_LABELS := {
	"infantry": "Gyalogsági raj",
	"carrier": "Páncélozott szállító",
	"brute": "Mordra ostromlény",
}

const UNIT_PROFILES := {
	"infantry": {"cost": 120, "build_time": 8.0, "population": 3, "role": "területfoglalás"},
	"carrier": {"cost": 260, "build_time": 14.0, "population": 4, "role": "gyalogsági támogatás"},
	"brute": {"cost": 360, "build_time": 20.0, "population": 6, "role": "lassú taunt és közelharc"},
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
