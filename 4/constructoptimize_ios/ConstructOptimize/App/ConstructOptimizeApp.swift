import SwiftUI
import CoreData

@main
struct ConstructOptimizeApp: App {
    let persistenceController = PersistenceController.shared
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
                .environmentObject(APIClient.shared)
                .environmentObject(LocationService.shared)
                .environmentObject(NotificationService.shared)
        }
    }
}

// MARK: - Core Data Stack
class PersistenceController {
    static let shared = PersistenceController()
    
    static var preview: PersistenceController = {
        let result = PersistenceController(inMemory: true)
        let viewContext = result.container.viewContext
        
        // Créer des données de test pour les previews
        let sampleProduit = ProduitEntity(context: viewContext)
        sampleProduit.id = UUID()
        sampleProduit.nom = "Ciment Portland"
        sampleProduit.descriptionProduit = "Ciment de haute qualité pour construction"
        sampleProduit.prixMin = 15.50
        sampleProduit.uniteMesure = "sac"
        
        do {
            try viewContext.save()
        } catch {
            let nsError = error as NSError
            fatalError("Erreur lors de la création des données de test: \(nsError), \(nsError.userInfo)")
        }
        return result
    }()
    
    let container: NSPersistentContainer
    
    init(inMemory: Bool = false) {
        container = NSPersistentContainer(name: "ConstructOptimize")
        
        if inMemory {
            container.persistentStoreDescriptions.first!.url = URL(fileURLWithPath: "/dev/null")
        }
        
        container.loadPersistentStores { _, error in
            if let error = error as NSError? {
                fatalError("Erreur Core Data: \(error), \(error.userInfo)")
            }
        }
        
        container.viewContext.automaticallyMergesChangesFromParent = true
    }
}

// MARK: - Core Data Extensions
extension PersistenceController {
    func save() {
        let context = container.viewContext
        
        if context.hasChanges {
            do {
                try context.save()
            } catch {
                let nsError = error as NSError
                fatalError("Erreur lors de la sauvegarde: \(nsError), \(nsError.userInfo)")
            }
        }
    }
    
    func delete(_ object: NSManagedObject) {
        container.viewContext.delete(object)
        save()
    }
    
    func fetch<T: NSManagedObject>(_ request: NSFetchRequest<T>) -> [T] {
        do {
            return try container.viewContext.fetch(request)
        } catch {
            print("Erreur lors du fetch: \(error)")
            return []
        }
    }
}
