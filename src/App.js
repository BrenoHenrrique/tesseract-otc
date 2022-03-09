import React from 'react';
import { createWorker } from 'tesseract.js';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css';
import 'filepond/dist/filepond.min.css';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap';

registerPlugin(FilePondPluginImagePreview);

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            files: [],
            quantity: 0,
            isProcessing: false,
            ocrText: '',
            pctg: '0.00'
        }
        this.pond = React.createRef();
        this.worker = React.createRef();
        this.updateProgressAndLog = this.updateProgressAndLog.bind(this);
    }

    generateFile(blobStore) {
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blobStore);
            return;
        }
        let createObjectURL = window.URL.createObjectURL(blobStore);
        let link = document.createElement("a");
        document.body.appendChild(link);
        link.href = createObjectURL;
        link.download = `book.txt`;
        link.click();
        window.URL.revokeObjectURL(createObjectURL);
        link.remove();
    }

    async doOCR() {
        let texts = "";
        this.setState({
            isProcessing: true,
            pctg: '0.00'
        });
        let i = 0;
        for (const file of this.state.files) {
            await this.worker.load();
            await this.worker.loadLanguage('eng');
            await this.worker.initialize('eng');
            const { data: { text } } = await this.worker.recognize(file.file);
            texts = texts + text + `\n-----------------page ${i = i + 1}\n`;
            this.setState({ quantity: this.state.quantity - 1 });
        };
        this.setState({
            isProcessing: false,
        });

        const blob = new Blob([texts], { type: 'text/plain;charset=utf-8' });
        this.generateFile(blob);
    };

    updateProgressAndLog(m) {

        // Maximum value out of which percentage needs to be
        // calculated. In our case it's 0 for 0 % and 1 for Max 100%
        // DECIMAL_COUNT specifies no of floating decimal points in our
        // Percentage
        var MAX_PARCENTAGE = 1;
        var DECIMAL_COUNT = 2;

        if (m.status === "recognizing text") {
            var pctg = (m.progress / MAX_PARCENTAGE) * 100
            this.setState({
                pctg: pctg.toFixed(DECIMAL_COUNT)
            })

        }
    }

    componentDidMount() {
        // Logs the output object to Update Progress, which
        // checks for Tesseract JS status & Updates the progress
        this.worker = createWorker({
            logger: m => this.updateProgressAndLog(m),
        });

    }

    render() {
        return (
            <div className="App">
                <div className="container">
                    <div style={{ marginTop: "10%" }} className="row">
                        <div className="col-md-12">
                            <div className="card">
                                <h5 className="card-header">
                                    <div style={{ margin: "1%", textAlign: "left" }} className="row">
                                        <div className="col-md-12">
                                            <i className={"fas fa-sync fa-2x " + (this.state.isProcessing ? "fa-spin" : "")} />
                                            <span
                                                className="status-text"
                                            >
                                                {this.state.isProcessing ? `Processing Image ( ${this.state.pctg} % )` : "Remaining Items"} {this.state.quantity}
                                            </span>
                                        </div>
                                    </div>
                                </h5>
                            </div>
                        </div>

                        <div className="col-md-12">
                            <Button
                                style={{ margin: "20px 0", }}
                                onClick={() => this.doOCR()}
                            >Get Text</Button>
                            <FilePond ref={ref => this.pond = ref}
                                onaddfile={(err, file) => {
                                    this.setState({
                                        files: [...this.state.files, file],
                                        quantity: this.state.quantity + 1
                                    });
                                }}
                                onremovefile={(err, fiile) => this.setState({ ocrText: '' })}
                                allowMultiple
                            />
                        </div>
                        <div className="col-md-4">

                        </div>
                    </div>


                    <div className="ocr-text">

                    </div>
                </div>

            </div>
        );
    }
}

export default App;
