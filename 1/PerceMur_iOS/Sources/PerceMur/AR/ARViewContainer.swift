import SwiftUI
import ARKit
import RealityKit

struct ARViewContainer: UIViewRepresentable {
    @ObservedObject var viewModel: ARViewModel
    let project: Project

    func makeUIView(context: Context) -> ARView {
        let arView = ARView(frame: .zero)
        arView.addGestureRecognizer(
            UITapGestureRecognizer(target: context.coordinator, action: #selector(Coordinator.handleTap(_:)))
        )
        viewModel.setup(arView: arView, project: project)
        return arView
    }

    func updateUIView(_ uiView: ARView, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(viewModel: viewModel)
    }

    class Coordinator: NSObject, ARSessionDelegate {
        let viewModel: ARViewModel

        init(viewModel: ARViewModel) {
            self.viewModel = viewModel
        }

        @objc func handleTap(_ gesture: UITapGestureRecognizer) {
            let location = gesture.location(in: gesture.view)
            Task { @MainActor in
                viewModel.handleTap(at: location)
            }
        }

        func session(_ session: ARSession, didUpdate frame: ARFrame) {
            Task { @MainActor in
                viewModel.processLiDARFrame(frame)
            }
        }
    }
}
