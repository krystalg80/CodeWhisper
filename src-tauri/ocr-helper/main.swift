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
// Language correction biases recognized text toward statistically common natural-language
// patterns (e.g. "i" over "j", since it's a far more common single-letter token) — actively
// wrong for reading source code verbatim, where every character must be exact.
request.usesLanguageCorrection = false

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
