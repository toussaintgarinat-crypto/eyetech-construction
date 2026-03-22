import SwiftUI

@MainActor
class ProjectsViewModel: ObservableObject {
    @Published var projects: [Project] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var showCreateProject = false

    func loadProjects() async {
        isLoading = true
        errorMessage = nil
        do {
            projects = try await APIClient.shared.getProjects()
        } catch {
            errorMessage = "Impossible de charger les projets."
        }
        isLoading = false
    }

    func createProject(name: String, description: String, location: String) async {
        do {
            let project = try await APIClient.shared.createProject(
                name: name,
                description: description,
                location: location
            )
            projects.insert(project, at: 0)
            showCreateProject = false
        } catch {
            errorMessage = "Erreur lors de la création du projet."
        }
    }
}
