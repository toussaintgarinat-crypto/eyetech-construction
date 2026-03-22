import Foundation
import Combine

class RechercheViewModel: ObservableObject {
    @Published var resultats: [ResultatComparaison] = []
    @Published var produits: [Produit] = []
    @Published var isLoading: Bool = false
    @Published var searchText: String = ""
    @Published var errorMessage: String?
    @Published var rechercheEnCours: RechercheComparaison?
    @Published var filtres: FiltresRecherche = .defaut
    @Published var tri: TriRecherche = .prix

    private var cancellables = Set<AnyCancellable>()

    // MARK: - Rechercher des produits
    func rechercherProduits() {
        guard !searchText.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        isLoading = true
        errorMessage = nil

        APIClient.shared.rechercherProduits(terme: searchText, filtres: filtres)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] completion in
                self?.isLoading = false
                if case .failure(let error) = completion {
                    self?.errorMessage = error.localizedDescription
                }
            } receiveValue: { [weak self] paginated in
                self?.produits = paginated.results
            }
            .store(in: &cancellables)
    }

    // MARK: - Lancer une comparaison de prix
    func lancerComparaison(produitId: UUID, quantite: Int = 1) {
        isLoading = true
        errorMessage = nil

        let request = CreerRechercheRequest(
            termeRecherche: searchText,
            produits: [ElementRechercheRequest(produitId: produitId, quantiteDemandee: quantite, priorite: 1, notes: nil)],
            filtres: filtres,
            triPar: tri
        )

        APIClient.shared.creerRechercheComparaison(recherche: request)
            .receive(on: DispatchQueue.main)
            .flatMap { [weak self] recherche -> AnyPublisher<[ResultatComparaison], APIError> in
                self?.rechercheEnCours = recherche
                return APIClient.shared.obtenirResultatsComparaison(rechercheId: recherche.id)
            }
            .sink { [weak self] completion in
                self?.isLoading = false
                if case .failure(let error) = completion {
                    self?.errorMessage = error.localizedDescription
                }
            } receiveValue: { [weak self] resultats in
                self?.resultats = resultats
            }
            .store(in: &cancellables)
    }

    // MARK: - Réinitialiser
    func reinitialiser() {
        searchText = ""
        resultats = []
        produits = []
        rechercheEnCours = nil
        errorMessage = nil
    }
}
