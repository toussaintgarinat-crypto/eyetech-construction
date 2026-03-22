import SwiftUI

struct ProjectsView: View {
    @StateObject private var viewModel = ProjectsViewModel()
    @State private var newProjectName = ""
    @State private var newProjectDescription = ""
    @State private var newProjectLocation = ""

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView("Chargement des projets...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if viewModel.projects.isEmpty {
                    emptyState
                } else {
                    projectList
                }
            }
            .navigationTitle("Projets")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button(action: { viewModel.showCreateProject = true }) {
                        Image(systemName: "plus.circle.fill")
                            .foregroundStyle(.cyan)
                            .font(.title3)
                    }
                }
            }
            .sheet(isPresented: $viewModel.showCreateProject) {
                createProjectSheet
            }
            .alert("Erreur", isPresented: .constant(viewModel.errorMessage != nil)) {
                Button("OK") { viewModel.errorMessage = nil }
            } message: {
                Text(viewModel.errorMessage ?? "")
            }
        }
        .task { await viewModel.loadProjects() }
    }

    private var projectList: some View {
        List {
            ForEach(viewModel.projects) { project in
                NavigationLink(destination: ProjectDetailView(project: project)) {
                    ProjectRowView(project: project)
                }
                .listRowBackground(Color(UIColor.secondarySystemBackground))
            }
        }
        .refreshable { await viewModel.loadProjects() }
    }

    private var emptyState: some View {
        VStack(spacing: 20) {
            Image(systemName: "folder.badge.plus")
                .font(.system(size: 60))
                .foregroundStyle(.gray)
            Text("Aucun projet")
                .font(.title2.bold())
            Text("Créez votre premier projet de perçage")
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button("Créer un projet") {
                viewModel.showCreateProject = true
            }
            .buttonStyle(.borderedProminent)
            .tint(.cyan)
        }
        .padding()
    }

    private var createProjectSheet: some View {
        NavigationStack {
            Form {
                Section("Informations du projet") {
                    TextField("Nom du projet", text: $newProjectName)
                    TextField("Description", text: $newProjectDescription)
                    TextField("Adresse / Localisation", text: $newProjectLocation)
                }
            }
            .navigationTitle("Nouveau projet")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") {
                        viewModel.showCreateProject = false
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Créer") {
                        Task {
                            await viewModel.createProject(
                                name: newProjectName,
                                description: newProjectDescription,
                                location: newProjectLocation
                            )
                            newProjectName = ""
                            newProjectDescription = ""
                            newProjectLocation = ""
                        }
                    }
                    .disabled(newProjectName.isEmpty)
                }
            }
        }
        .presentationDetents([.medium])
    }
}

struct ProjectRowView: View {
    let project: Project

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Image(systemName: "building.2.fill")
                    .foregroundStyle(.cyan)
                Text(project.name)
                    .font(.headline)
            }
            if let desc = project.description, !desc.isEmpty {
                Text(desc)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }
            if let loc = project.location, !loc.isEmpty {
                Label(loc, systemImage: "mappin.circle")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}
