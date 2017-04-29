# Building the front end
cd ui
yarn
ng build -prod -aot
cp -R dist/ ../service/src/main/resources

# Building the back end
cd ../service
sh install.sh -ssl ~/keystore.jks
