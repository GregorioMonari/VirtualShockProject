echo "# VSH-PACKAGER #"
ROOT_PATH=. #current dir

# Sources
ELECTRON_BINARIES_URL=https://github.com/electron/electron/releases/download/v28.2.5/electron-v28.2.5-win32-x64.zip
FRONTEND_PATH=${ROOT_PATH}/frontend
ASSEMBLER_PATH=${ROOT_PATH}/assembler
VSH_JRE_PATH=${ROOT_PATH}/resources/vsh-jre
VM_JAR_PATH=${ROOT_PATH}/virtual-machine/target/vsh-vm-0.0.1-SNAPSHOT.jar

# Release
BASE_PATH=${ROOT_PATH}/release
BINARIES_PATH=${BASE_PATH}/binaries
OUTPUT_PATH=${BASE_PATH}/output

echo "Cleaning up..."
# Remove previous output files
if [ -d $OUTPUT_PATH ]
then
    # Remove the directory and its contents recursively
    rm -r $OUTPUT_PATH
    echo "Directory ${OUTPUT_PATH} removed successfully."
else
    echo "Directory ${OUTPUT_PATH} does not exist, skipping remove."
fi

# Create release folder
mkdir $BASE_PATH
mkdir $BINARIES_PATH
mkdir $OUTPUT_PATH
echo "Created directory ${BASE_PATH}"


# Download latest ELECTRON release if file does not exist
ELECTRON_DOWNLOADED_BINARIES_PATH=$BINARIES_PATH/electron-binaries.zip
if [ -f ${ELECTRON_DOWNLOADED_BINARIES_PATH} ]
then
    echo "Electron binaries already present at: ${ELECTRON_DOWNLOADED_BINARIES_PATH}, skipping download"
else
    echo "Downloading electron binaries from: ${ELECTRON_BINARIES_URL}"
    curl -L -o $ELECTRON_DOWNLOADED_BINARIES_PATH $ELECTRON_BINARIES_URL
    echo "Electron binaries saved to: ${ELECTRON_DOWNLOADED_BINARIES_PATH}"
fi

# Unzip the file
echo "Extracting electron binaries"
unzip $ELECTRON_DOWNLOADED_BINARIES_PATH -d $OUTPUT_PATH
echo "Extracted electron binaries to: ${OUTPUT_PATH}"

# Validate electron installation
echo "Validating electron installation..."

if [ -f ${OUTPUT_PATH}/resources/default_app.asar ]
then
    echo "Electron installation is valid, proceeding to package application"
else
    echo "Electron installation is invalid, aborting installation procedure!"
    exit 1
fi


# APPLICATION PACKAGING
echo "# PACKAGING APPLICATION #"

# Remove default app
rm -r ${OUTPUT_PATH}/resources/default_app.asar
echo "Removed default_app.asar"
# Create app directory
APP_DIR=${OUTPUT_PATH}/resources/app
mkdir ${APP_DIR}
echo "Created app dir"

# Copy frontend
echo "Importing resources into app dir: ${APP_DIR}..."
cp -r ${FRONTEND_PATH}/* ${APP_DIR}
echo "- Frontend imported"


# TRICKY PART
APP_MODULES=${APP_DIR}/app-modules
# Copy assembler api
cp -r ${ASSEMBLER_PATH} ${APP_MODULES}
echo "- Assembler imported"
# Copy vsh-jre
cp -r ${VSH_JRE_PATH} ${APP_MODULES}
echo "- Vsh-Jre imported"
# Copy vsh-virtual-machine
cp -r ${VM_JAR_PATH} ${APP_MODULES}
echo "- VirtualMachine imported"

# END
echo "--- PACKAGING COMPLETED! ---"