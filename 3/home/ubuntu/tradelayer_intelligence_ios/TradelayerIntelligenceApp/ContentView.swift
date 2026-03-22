import SwiftUI
import RealityKit

struct ContentView: View {
    @StateObject var arLayerManager = ARLayerManager()
    @StateObject var voiceCommandManager = VoiceCommandManager()
    @State private var showTutorial = false

    var body: some View {
        ZStack {
            ARViewContainer(arLayerManager: arLayerManager)
                .edgesIgnoringSafeArea(.all)

            // Bouton Guide en haut à droite
            VStack {
                HStack {
                    Spacer()
                    Button(action: { showTutorial = true }) {
                        Image(systemName: "questionmark.circle.fill")
                            .font(.title2)
                            .padding(10)
                            .background(Color.black.opacity(0.6))
                            .foregroundColor(.white)
                            .clipShape(Circle())
                    }
                    .padding(.top, 60)
                    .padding(.trailing, 16)
                }
                Spacer()
            }

            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Button(action: {
                        if voiceCommandManager.isRecording {
                            voiceCommandManager.stopRecording()
                        } else {
                            do {
                                try voiceCommandManager.startRecording()
                            } catch {
                                print("Error starting recording: \(error.localizedDescription)")
                            }
                        }
                    }) {
                        Image(systemName: voiceCommandManager.isRecording ? "mic.fill" : "mic.slash.fill")
                            .font(.largeTitle)
                            .padding()
                            .background(voiceCommandManager.isRecording ? Color.red : Color.blue)
                            .foregroundColor(.white)
                            .clipShape(Circle())
                    }
                    .padding()
                    Spacer()
                }
                Text(voiceCommandManager.recognizedText)
                    .padding()
                    .background(Color.black.opacity(0.7))
                    .foregroundColor(.white)
                    .cornerRadius(10)
                    .padding(.bottom, 50)
            }
        }
        .onAppear {
            let projectId = UUID() // Placeholder for actual project ID
            arLayerManager.loadAndDisplayLayers(forProject: projectId)
            voiceCommandManager.currentProjectId = projectId
        }
        .sheet(isPresented: $showTutorial) {
            TLTutorialView(isPresented: $showTutorial)
        }
    }
}

struct ARViewContainer: UIViewRepresentable {
    @ObservedObject var arLayerManager: ARLayerManager
    
    func makeUIView(context: Context) -> ARView {
        let arView = ARView(frame: .zero)
        arLayerManager.setupARView(arView: arView)
        return arView
    }
    
    func updateUIView(_ uiView: ARView, context: Context) {}
}

#Preview {
    ContentView()
}

