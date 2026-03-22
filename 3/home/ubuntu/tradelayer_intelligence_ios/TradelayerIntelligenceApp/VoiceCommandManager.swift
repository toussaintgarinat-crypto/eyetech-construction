import Foundation
import Speech
import AVFoundation

class VoiceCommandManager: ObservableObject {
    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "fr-FR"))
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    
    @Published var recognizedText: String = ""
    @Published var isRecording: Bool = false
    @Published var authorizationStatus: SFSpeechRecognizerAuthorizationStatus = .notDetermined
    
    var currentProjectId: UUID? // Add a property to hold the current project ID
    
    init() {
        requestAuthorization()
    }
    
    func requestAuthorization() {
        SFSpeechRecognizer.requestAuthorization { authStatus in
            DispatchQueue.main.async {
                self.authorizationStatus = authStatus
            }
        }
    }
    
    func startRecording() throws {
        guard authorizationStatus == .authorized else {
            print("Speech recognition not authorized.")
            return
        }
        
        // Cancel the previous task if it's running.
        if let recognitionTask = recognitionTask {
            recognitionTask.cancel()
            self.recognitionTask = nil
        }
        
        let audioSession = AVAudioSession.sharedInstance()
        try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
        try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        let inputNode = audioEngine.inputNode

        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let recognitionRequest = recognitionRequest else { fatalError("Unable to create a SFSpeechAudioBufferRecognitionRequest object") }
        recognitionRequest.shouldReportPartialResults = true
        
        recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest) { result, error in
            var isFinal = false
            
            if let result = result {
                self.recognizedText = result.bestTranscription.formattedString
                isFinal = result.isFinal
            }
            
            if error != nil || isFinal {
                self.audioEngine.stop()
                inputNode.removeTap(onBus: 0)
                self.recognitionRequest = nil
                self.recognitionTask = nil
                self.isRecording = false
                
                if isFinal && !self.recognizedText.isEmpty {
                    self.processVoiceCommand(self.recognizedText)
                }
            }
        }
        
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { (buffer: AVAudioPCMBuffer, when: AVAudioTime) in
            self.recognitionRequest?.append(buffer)
        }
        
        audioEngine.prepare()
        try audioEngine.start()
        isRecording = true
        recognizedText = ""
    }
    
    func stopRecording() {
        audioEngine.stop()
        recognitionRequest?.endAudio()
        isRecording = false
    }
    
    private func processVoiceCommand(_ command: String) {
        print("Processing command: \(command)")
        guard let projectId = currentProjectId else {
            print("Error: currentProjectId is nil. Cannot send voice command.")
            return
        }
        
        APIClient.shared.sendVoiceCommand(commandText: command, projectId: projectId) { result in
            switch result {
            case .success(let commandeVocale):
                DispatchQueue.main.async {
                    print("Voice command sent successfully: \(commandeVocale.intention_detectee ?? "")")
                    // Optionally update UI with response from backend
                }
            case .failure(let error):
                print("Error sending voice command: \(error.localizedDescription)")
            }
        }
    }
}

