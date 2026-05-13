import Vision
import Foundation

guard CommandLine.arguments.count == 2 else {
    fputs("Usage: ocr-helper <image-path>\n", stderr)
    exit(1)
}

let path = CommandLine.arguments[1]
let url = URL(fileURLWithPath: path)

guard FileManager.default.fileExists(atPath: path) else {
    fputs("File not found: \(path)\n", stderr)
    exit(1)
}

let semaphore = DispatchSemaphore(value: 0)
var recognizedText = ""
var errorMessage = ""

let request = VNRecognizeTextRequest { request, error in
    defer { semaphore.signal() }
    if let error = error {
        errorMessage = error.localizedDescription
        return
    }
    guard let observations = request.results as? [VNRecognizedTextObservation] else { return }
    recognizedText = observations
        .compactMap { $0.topCandidates(1).first?.string }
        .joined(separator: "\n")
}

request.recognitionLevel = .accurate
request.usesLanguageCorrection = true

let handler = VNImageRequestHandler(url: url, options: [:])
do {
    try handler.perform([request])
    semaphore.wait()
    if !errorMessage.isEmpty {
        fputs("OCR error: \(errorMessage)\n", stderr)
        exit(1)
    }
    print(recognizedText)
} catch {
    fputs("Handler error: \(error.localizedDescription)\n", stderr)
    exit(1)
}
