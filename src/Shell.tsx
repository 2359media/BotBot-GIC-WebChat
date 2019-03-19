import * as React from 'react';
import { ChatState } from './Store';
import { classList } from './Chat';
import { connect } from 'react-redux';
import { Strings } from './Strings';
import { Speech } from './SpeechModule'
import { ChatActions, sendMessage, sendFiles } from './Store';

interface Props {
    inputText: string,
    strings: Strings,
    listening: boolean,

    onChangeText: (inputText: string) => void

    sendMessage: (inputText: string) => void,
    sendFiles: (files: FileList) => void,
    stopListening: () => void,
    startListening: () => void
}

export interface ShellFunctions {
    focus: (appendKey?: string) => void
}

const MAX_CHARACTER = 256;

class ShellContainer extends React.Component<Props> implements ShellFunctions {
    private textInput: HTMLInputElement;
    private fileInput: HTMLInputElement;

    private sendMessage() {
        if (this.props.inputText.trim().length > 0) {
            this.props.sendMessage(this.props.inputText);
        }
    }

    private handleSendButtonKeyPress(evt: React.KeyboardEvent<HTMLButtonElement>) {
        if (evt.key === 'Enter' || evt.key === ' ') {
            evt.preventDefault();
            this.sendMessage();
            this.textInput.focus();
        }
    }

    private handleUploadButtonKeyPress(evt: React.KeyboardEvent<HTMLLabelElement>) {
        if (evt.key === 'Enter' || evt.key === ' ') {
            evt.preventDefault();
            this.fileInput.click();
        }
    }

    private onKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            this.sendMessage();
        }
    }

    private onClickSend() {
        this.sendMessage();
    }

    private onChangeFile() {
        this.props.sendFiles(this.fileInput.files);
        this.fileInput.value = null;
        this.textInput.focus();
    }

    private onTextInputFocus(){
        if (this.props.listening) {
            this.props.stopListening();
        }
    }

    private onClickMic() {
        if (this.props.listening) {
            this.props.stopListening();
        } else {
            this.props.startListening();
        }
    }

    public focus(appendKey?: string) {
        this.textInput.focus();

        if (appendKey) {
            this.props.onChangeText(this.props.inputText + appendKey);
        }
    }

    render() {
        const className = classList(
            'wc-console',
            this.props.inputText.length > 0 && 'has-text'
        );

        const showMicButton = this.props.listening || (Speech.SpeechRecognizer.speechIsAvailable()  && !this.props.inputText.length);

        const sendButtonClassName = classList(
            'wc-send',
            showMicButton && 'hidden'
        );

        const micButtonClassName = classList(
            'wc-mic',
            !showMicButton && 'hidden',
            this.props.listening && 'active',
            !this.props.listening && 'inactive'
        );

        const placeholder = this.props.listening ? this.props.strings.listeningIndicator : this.props.strings.consolePlaceholder;

        return (
            <div className={ className }>
                {/*<label
                    className="wc-upload"
                    onKeyPress={ evt => this.handleUploadButtonKeyPress(evt) }
                    tabIndex={ 0 }
                >
                    <svg>
                        <path d="M19.96 4.79m-2 0a2 2 0 0 1 4 0 2 2 0 0 1-4 0zM8.32 4.19L2.5 15.53 22.45 15.53 17.46 8.56 14.42 11.18 8.32 4.19ZM1.04 1L1.04 17 24.96 17 24.96 1 1.04 1ZM1.03 0L24.96 0C25.54 0 26 0.45 26 0.99L26 17.01C26 17.55 25.53 18 24.96 18L1.03 18C0.46 18 0 17.55 0 17.01L0 0.99C0 0.45 0.47 0 1.03 0Z" />
                    </svg>
                    <input
                        id="wc-upload-input"
                        tabIndex={ -1 }
                        type="file"
                        ref={ input => this.fileInput = input }
                        multiple
                        onChange={ () => this.onChangeFile() }
                        aria-label={ this.props.strings.uploadFile }
                        role="button"
                    />
                </label>*/}
                <div className="wc-textbox">
                    <input
                        type="text"
                        className="wc-shellinput"
                        ref={ input => this.textInput = input }
                        autoFocus
                        value={ this.props.inputText }
                        onChange={ _ => this.props.onChangeText(this.textInput.value) }
                        onKeyPress={ e => this.onKeyPress(e) }
                        onFocus={ () => this.onTextInputFocus() }
                        placeholder={ placeholder }
                        aria-label={ this.props.inputText ? null : placeholder }
                        aria-live="polite"
                        maxLength={MAX_CHARACTER}
                    />
                    <span className="wc-counter" style={{
                        color: this.props.inputText.length === MAX_CHARACTER ? 'red' : ''
                    }}>{`${this.props.inputText.length}/${MAX_CHARACTER} characters ${this.props.inputText.length === MAX_CHARACTER ? ' - character limit reached' : ''}`}</span>
                </div>
                <button
                    className={ sendButtonClassName }
                    onClick={ () => this.onClickSend() }
                    aria-label={ this.props.strings.send }
                    role="button"
                    onKeyPress={ evt => this.handleSendButtonKeyPress(evt) }
                    tabIndex={ 0 }
                >
                    <svg width="24px" height="21px" viewBox="0 0 24 21"><g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"><g id="wc-send-icon" transform="translate(-358.000000, -593.000000)" fillRule="nonzero"><g transform="translate(30.000000, 576.000000)"><polygon id="btn_send_inactive" points="328 37.5714286 352 27.2857143 328 17 328 25 345.142857 27.2857143 328 29.5714286"></polygon></g></g></g></svg>
                </button>
                {/*<button
                    className={ micButtonClassName }
                    onClick={ () => this.onClickMic() }
                    aria-label={ this.props.strings.speak }
                    role="button"
                    tabIndex={ 0 }
                >
                   <svg width="28" height="22" viewBox="0 0 58 58" >
                        <path d="M 44 28 C 43.448 28 43 28.447 43 29 L 43 35 C 43 42.72 36.72 49 29 49 C 21.28 49 15 42.72 15 35 L 15 29 C 15 28.447 14.552 28 14 28 C 13.448 28 13 28.447 13 29 L 13 35 C 13 43.485 19.644 50.429 28 50.949 L 28 56 L 23 56 C 22.448 56 22 56.447 22 57 C 22 57.553 22.448 58 23 58 L 35 58 C 35.552 58 36 57.553 36 57 C 36 56.447 35.552 56 35 56 L 30 56 L 30 50.949 C 38.356 50.429 45 43.484 45 35 L 45 29 C 45 28.447 44.552 28 44 28 Z"/>
                        <path id="micFilling" d="M 28.97 44.438 L 28.97 44.438 C 23.773 44.438 19.521 40.033 19.521 34.649 L 19.521 11.156 C 19.521 5.772 23.773 1.368 28.97 1.368 L 28.97 1.368 C 34.166 1.368 38.418 5.772 38.418 11.156 L 38.418 34.649 C 38.418 40.033 34.166 44.438 28.97 44.438 Z"/>
                        <path d="M 29 46 C 35.065 46 40 41.065 40 35 L 40 11 C 40 4.935 35.065 0 29 0 C 22.935 0 18 4.935 18 11 L 18 35 C 18 41.065 22.935 46 29 46 Z M 20 11 C 20 6.037 24.038 2 29 2 C 33.962 2 38 6.037 38 11 L 38 35 C 38 39.963 33.962 44 29 44 C 24.038 44 20 39.963 20 35 L 20 11 Z"/>
                    </svg>
                </button>*/}
            </div>
        );
    }
}

export const Shell = connect(
    (state: ChatState) => ({
        // passed down to ShellContainer
        inputText: state.shell.input,
        strings: state.format.strings,
        // only used to create helper functions below
        locale: state.format.locale,
        user: state.connection.user,
        listening : state.shell.listening
    }), {
        // passed down to ShellContainer
        onChangeText: (input: string) => ({ type: 'Update_Input', input, source: "text" } as ChatActions),
        stopListening:  () => ({ type: 'Listening_Stop' }),
        startListening:  () => ({ type: 'Listening_Starting' }),
        // only used to create helper functions below
        sendMessage,
        sendFiles
    }, (stateProps: any, dispatchProps: any, ownProps: any): Props => ({
        // from stateProps
        inputText: stateProps.inputText,
        strings: stateProps.strings,
        listening : stateProps.listening,
        // from dispatchProps
        onChangeText: dispatchProps.onChangeText,
        // helper functions
        sendMessage: (text: string) => dispatchProps.sendMessage(text, stateProps.user, stateProps.locale),
        sendFiles: (files: FileList) => dispatchProps.sendFiles(files, stateProps.user, stateProps.locale),
        startListening: () => dispatchProps.startListening(),
        stopListening: () => dispatchProps.stopListening()
    }), {
        withRef: true
    }
)(ShellContainer);
