class ClaudeColor < Formula
  desc "AI-powered terminal color palette generator with preference learning"
  homepage "https://github.com/joshleichtung/claude-color"
  url "https://registry.npmjs.org/claude-color/-/claude-color-1.0.0.tgz"
  sha256 "PLACEHOLDER_SHA256" # Will be updated during release
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    system "#{bin}/claude-color", "--version"
  end
end
