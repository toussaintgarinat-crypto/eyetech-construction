import Foundation
import SwiftUI

// MARK: - Backend Data Models

struct CorpsMetier: Codable, Identifiable {
    let id: String // Assuming backend sends UUID as string
    let nom: String
    let nom_affichage: String
    let description: String
    let couleur_principale: String
    let icone: String
    let actif: Bool
    let ordre_affichage: Int
}

struct Projet: Codable, Identifiable {
    let id: UUID
    let nom: String
    let description: String
    let adresse: String
    let latitude: Double?
    let longitude: Double?
    let surface_totale: Double?
    let nombre_etages: Int?
    let type_batiment: String
    let statut: String
}

struct CalqueMetier: Codable, Identifiable {
    let id: UUID
    let nom: String
    let description: String
    let projet: UUID
    let corps_metier: String // Assuming this is the 'nom' of CorpsMetier
    let couleur: String
    let opacite: Float
    let style_ligne: String
    let epaisseur_ligne: Float
    let visible: Bool
    let verrouille: Bool
    let priorite_affichage: Int
    let version: Int
}

struct ElementCalque: Codable, Identifiable {
    let id: UUID
    let calque: UUID
    let type_element: String
    let nom: String
    let description: String
    let geometrie: [String: AnyCodable]
    let couleur: String
    let opacite: Float
    let taille: Float
    let rotation: Float
    let proprietes_metier: [String: AnyCodable]
    let visible: Bool
    let verrouille: Bool
}

struct CommandeVocale: Codable, Identifiable {
    let id: UUID
    let utilisateur: String // Assuming user ID is a string
    let projet: UUID?
    let fichier_audio: String?
    let duree_audio: Float
    let transcription_brute: String
    let transcription_corrigee: String?
    let intention_detectee: String?
    let entites_extraites: [String: AnyCodable]?
    let contexte: [String: AnyCodable]?
    let action_resultante: String?
    let succes_execution: Bool?
    let reponse_generee: String?
    let horodatage: Date
    let traitee: Bool
}

struct ZoneAnalyse: Codable, Identifiable {
    let id: UUID
    let projet: UUID
    let nom: String
    let description: String
    let geometrie_zone: [String: AnyCodable]
    let parametres_analyse: [String: AnyCodable]
    let visible: Bool
    let createur: String? // Assuming user ID is a string
}

struct PointInteret: Codable, Identifiable {
    let id: UUID
    let projet: UUID
    let nom: String
    let description: String
    let position_x: Float
    let position_y: Float
    let position_z: Float
    let type_point: String
    let element_lie: UUID?
    let metadata: [String: AnyCodable]
    let createur: String? // Assuming user ID is a string
}

struct MesureSpatiale: Codable, Identifiable {
    let id: UUID
    let projet: UUID
    let calque: UUID?
    let type_mesure: String
    let valeur: Float
    let unite: String
    // elements_impliques and points_references might need custom handling or be simplified
    let description: String
    let contexte_mesure: [String: AnyCodable]
    let realisee_par: String? // Assuming user ID is a string
}

// Helper for decoding JSONField (geometrie, proprietes_metier)
struct AnyCodable: Codable, Hashable {
    let value: Any

    init(_ value: Any) {
        self.value = value
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let string = try? container.decode(String.self) {
            value = string
        } else if let int = try? container.decode(Int.self) {
            value = int
        } else if let double = try? container.decode(Double.self) {
            value = double
        } else if let bool = try? container.decode(Bool.self) {
            value = bool
        } else if let array = try? container.decode([AnyCodable].self) {
            value = array.map { $0.value }
        } else if let dictionary = try? container.decode([String: AnyCodable].self) {
            value = dictionary.mapValues { $0.value }
        } else if container.decodeNil() {
            value = NSNull()
        } else {
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "AnyCodable value cannot be decoded")
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        if let string = value as? String {
            try container.encode(string)
        } else if let int = value as? Int {
            try container.encode(int)
        } else if let double = value as? Double {
            try container.encode(double)
        } else if let bool = value as? Bool {
            try container.encode(bool)
        } else if let array = value as? [Any] {
            try container.encode(array.map(AnyCodable.init))
        } else if let dictionary = value as? [String: Any] {
            try container.encode(dictionary.mapValues(AnyCodable.init))
        } else if value is NSNull {
            try container.encodeNil()
        } else {
            throw EncodingError.invalidValue(value, EncodingError.Context(codingPath: container.codingPath, debugDescription: "AnyCodable value cannot be encoded"))
        }
    }
    
    static func == (lhs: AnyCodable, rhs: AnyCodable) -> Bool {
        // This is a simplified comparison. For complex types, deep comparison might be needed.
        String(describing: lhs.value) == String(describing: rhs.value)
    }

    func hash(into hasher: inout Hasher) {
        hasher.combine(String(describing: value))
    }
}

// MARK: - API Response Structures

struct CalquesMetiersAPIResponse: Codable {
    let calques: [CalqueMetier]
    let elements: [ElementCalque]
}

// MARK: - Utility Extensions

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit) -> RGB (24-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (255, int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

