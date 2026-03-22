import Foundation
import simd

// MARK: - Auth
struct TokenResponse: Codable {
    let access: String
    let refresh: String
}

// MARK: - Project
struct Project: Codable, Identifiable {
    let id: Int
    let name: String
    let description: String?
    let location: String?
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, name, description, location
        case createdAt = "created_at"
    }
}

struct CreateProjectPayload: Codable {
    let name: String
    let description: String
    let location: String
}

// MARK: - Drilling Point
struct DrillingPoint: Codable, Identifiable {
    let id: Int
    let project: Int
    let x: Double
    let y: Double
    let z: Double
    let description: String?
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, project, x, y, z, description
        case createdAt = "created_at"
    }

    var position: SIMD3<Float> {
        SIMD3<Float>(Float(x), Float(y), Float(z))
    }
}

struct CreateDrillingPointPayload: Codable {
    let project: Int
    let x: Double
    let y: Double
    let z: Double
    let description: String
}

// MARK: - AR Measurement
struct ARMeasurement: Codable, Identifiable {
    let id: Int
    let project: Int
    let data: [String: AnyCodable]?
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, project, data
        case createdAt = "created_at"
    }
}

struct CreateARMeasurementPayload: Codable {
    let project: Int
    let data: [String: String]
}

// MARK: - Obstacle (LiDAR)
struct Obstacle: Identifiable {
    let id = UUID()
    var position: SIMD3<Float>
    var type: ObstacleType
    var confidence: Float

    enum ObstacleType: String {
        case pipe = "Tuyau"
        case cable = "Câble"
        case beam = "Poutre"
        case wall = "Mur"
        case unknown = "Inconnu"
    }
}

// MARK: - Guide Line
struct GuideLine: Identifiable {
    let id = UUID()
    var anchorPosition: SIMD3<Float>
    var orientation: GuideOrientation
    var color: GuideColor

    enum GuideOrientation {
        case vertical, horizontal, both
    }

    enum GuideColor {
        case green, orange, red

        var rgba: SIMD4<Float> {
            switch self {
            case .green:  return SIMD4<Float>(0.2, 0.9, 0.2, 0.8)
            case .orange: return SIMD4<Float>(1.0, 0.6, 0.1, 0.8)
            case .red:    return SIMD4<Float>(0.9, 0.2, 0.2, 0.8)
            }
        }
    }
}

// MARK: - AnyCodable helper
struct AnyCodable: Codable {
    let value: Any

    init(_ value: Any) { self.value = value }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let v = try? container.decode(String.self) { value = v }
        else if let v = try? container.decode(Double.self) { value = v }
        else if let v = try? container.decode(Bool.self) { value = v }
        else { value = "" }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        if let v = value as? String { try container.encode(v) }
        else if let v = value as? Double { try container.encode(v) }
        else if let v = value as? Bool { try container.encode(v) }
    }
}
