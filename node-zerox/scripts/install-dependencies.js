const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");

const execPromise = promisify(exec);

const installPackage = async (command, packageName) => {
  try {
    const { stdout, stderr } = await execPromise(command);
    if (stderr) {
      throw new Error(`Failed to install ${packageName}: ${stderr}`);
    }
    return stdout;
  } catch (error) {
    throw new Error(`Failed to install ${packageName}: ${error.message}`);
  }
};

const isSudoAvailable = async () => {
  try {
    // Try running a sudo command
    await execPromise("sudo -n true");
    return true;
  } catch {
    return false;
  }
};

const checkAndInstall = async () => {
  try {
    const sudoAvailable = await isSudoAvailable();
    const isVercel = !!process.env.VERCEL;

    // Check and install Ghostscript
    try {
      await execPromise("gs --version");
    } catch {
      if (process.platform === "darwin") {
        await installPackage("brew install ghostscript", "Ghostscript");
      } else if (process.platform === "linux") {
        if (isVercel) {
          console.log("Vercel detected: Skipping Ghostscript installation.");
        } else {
          const command = sudoAvailable
            ? "sudo yum update -y && sudo yum install -y ghostscript"
            : "yum update -y && yum install -y ghostscript";
          await installPackage(command, "Ghostscript");
        }
      } else {
        throw new Error(
          "Please install Ghostscript manually from https://www.ghostscript.com/download.html"
        );
      }
    }

    // Check and install GraphicsMagick
    try {
      await execPromise("gm -version");
    } catch {
      if (process.platform === "darwin") {
        await installPackage("brew install graphicsmagick", "GraphicsMagick");
      } else if (process.platform === "linux") {
        if (isVercel) {
          console.log("Vercel detected: Skipping GraphicsMagick installation.");
        } else {
          const command = sudoAvailable
            ? "sudo yum update -y && sudo yum install -y graphicsmagick"
            : "yum update -y && yum install -y graphicsmagick";
          await installPackage(command, "GraphicsMagick");
        }
      } else {
        throw new Error(
          "Please install GraphicsMagick manually from http://www.graphicsmagick.org/download.html"
        );
      }
    }

    // Check and install LibreOffice
    try {
      await execPromise("soffice --version");
    } catch {
      if (process.platform === "darwin") {
        await installPackage("brew install --cask libreoffice", "LibreOffice");
      } else if (process.platform === "linux") {
        if (isVercel) {
          console.log("Vercel detected: Skipping LibreOffice installation.");
        } else {
          const command = sudoAvailable
            ? "sudo yum update -y && sudo yum install -y libreoffice"
            : "yum update -y && yum install -y libreoffice";
          await installPackage(command, "LibreOffice");
        }
      } else {
        throw new Error(
          "Please install LibreOffice manually from https://www.libreoffice.org/download/download/"
        );
      }
    }
  } catch (err) {
    console.error(`Error during installation: ${err.message}`);
    process.exit(1);
  }
};


checkAndInstall();
