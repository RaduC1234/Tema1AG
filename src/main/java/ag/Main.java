package ag;

import com.google.gson.Gson;
import javafx.application.Application;
import javafx.application.Platform;
import javafx.concurrent.Worker;
import javafx.geometry.HPos;
import javafx.geometry.VPos;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.scene.layout.Pane;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import javafx.stage.Stage;
import netscape.javascript.JSObject;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.net.URL;
import java.util.Objects;

public class Main extends Application {

    @Override
    public void start(Stage stage) throws Exception {

        stage.setTitle("Graph Viewer");

        stage.setOnCloseRequest(event -> {
            Platform.exit();
            System.exit(0);
        });

        stage.getIcons().add(new Image(Objects.requireNonNull(Main.class.getResourceAsStream("/assets/duke.png"))));

        WebModule webModule = new WebModule("/html/index.html");
        Scene scene = new Scene(webModule);
        stage.setScene(scene);

        stage.show();

        WebEngine webEngine = webModule.getWebEngine();

        // set up js -> java bridge
        webEngine.getLoadWorker().stateProperty().addListener((observable, oldValue, newValue) -> {
            if (Worker.State.SUCCEEDED == newValue) {

                JSObject window = (JSObject) webEngine.executeScript("window");
                window.setMember("Platform", this);
                window.setMember("Matrix", new MatrixHandler());
            }
        });
        webEngine.reload();
    }

    public void print(String text) {
        System.out.println(text);
    }

    public static class WebModule extends Pane {

        private final WebView browser = new WebView();
        private final WebEngine webEngine = browser.getEngine();

        public WebModule(String source) {

            URL url = Main.class.getResource(source);
            if (url != null) {
                webEngine.load(url.toString());
            } else {
                System.out.println("Error: HTML file not found!");
            }

            getChildren().add(browser);
        }

        @Override
        protected void layoutChildren() {
            double w = getWidth();
            double h = getHeight();
            layoutInArea(browser, 0, 0, w, h, 0, HPos.CENTER, VPos.CENTER);
        }

        public WebEngine getWebEngine() {
            return webEngine;
        }
    }

    public static void main(String[] args) {
        launch(args);
    }

    private class MatrixHandler {

        private final Gson gson = new Gson();

        public String loadMatrixFromFile(String filePath) {
            try (FileReader reader = new FileReader(filePath)) {
                double[][] matrix = gson.fromJson(reader, double[][].class);
                return gson.toJson(matrix);
            } catch (IOException e) {
                e.printStackTrace();
                return "Error: Could not load matrix.";
            }
        }

        public boolean saveMatrixToFile(String filePath, String matrixJson) {
            try (FileWriter writer = new FileWriter(new File(filePath))) {
                double[][] matrix = gson.fromJson(matrixJson, double[][].class);
                gson.toJson(matrix, writer);
                return true;
            } catch (IOException e) {
                e.printStackTrace();
                return false;
            }
        }
    }
}
