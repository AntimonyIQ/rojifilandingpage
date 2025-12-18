import React, { ReactNode } from "react";

export default class NotFound extends React.Component {

    componentDidMount(): void {
        document.title = "Page Not Found - Rojifi";
    };

    reload = (): void => {
        window.location.reload();
    };

    goHome = (): void => {
        window.location.href = "/";
    };

    render(): ReactNode {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-white p-6">
                <div className="max-w-lg w-full text-center">
                    <h1 className="text-[120px] font-thin leading-none text-gray-200 select-none">
                        404
                    </h1>

                    <div className="relative -mt-12">
                        <h2 className="text-2xl font-medium text-gray-900 mb-3">
                            Page not found
                        </h2>
                        <p className="text-gray-500 mb-10 font-light">
                            The page you are looking for doesn't exist or has been moved.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={this.goHome}
                                className="px-8 py-3 bg-black text-white text-sm tracking-wide rounded hover:bg-gray-800 transition-colors duration-300"
                            >
                                BACK HOME
                            </button>
                            <button
                                onClick={this.reload}
                                className="px-8 py-3 bg-white text-black border border-gray-200 text-sm tracking-wide rounded hover:border-gray-400 transition-colors duration-300"
                            >
                                RELOAD
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}