# Building the front end
cd ui
yarn
ng build --aot --build-optimizer
cp -R dist/ ../service/src/main/resources

# Building the back end
cd ../service
sh install.sh
