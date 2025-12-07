#! /bin/bash -e

force_compile_all=0
while getopts "a" opt; do
    case $opt in
        a)
            force_compile_all=1
            ;;
    esac
done

echo -e "\033[32mStarting build\033[0m"
modified="`git status --short | awk '{print $2}'`"

compile_solver_js() {
    google-closure-compiler -O ADVANCED --module_resolution NODE js/solver/*.js js/common/*.js --js_output_file dist/solver/solver.min.js
    echo -e "\033[34mcompiled worker\033[0m"
}

compile_ui_js() {
    google-closure-compiler -O ADVANCED --module_resolution NODE --chunk_output_type=ES_MODULES js/ui/*.js js/common/*.js ts/ui/externs.js --js_output_file dist/ui/ui.min.mjs
    echo -e "\033[34mcompiled ui\033[0m"
}

compiled_all=0
for tsfile in ts/common/* tsconfig.base.json
do
    if [ "$force_compile_all" -eq 1 ] || [[ ${modified[*]} =~ $tsfile ]]
    then
        tsc -b ts/common/ ts/ui/ ts/solver/
        compile_ui_js
        compile_solver_js
        compiled_all=1
        break
    fi
done

if [ "$compiled_all" -eq 0 ]
then
    for tsfile in ts/ui/*
    do
        if [[ ${modified[*]} =~ $tsfile ]]
        then
            tsc -b ts/ui/
            compile_ui_js
            break
        fi
    done

    for tsfile in ts/solver/*
    do
        if [[ ${modified[*]} =~ $tsfile ]]
        then
            tsc -b ts/solver/
            compile_solver_js
            break
        fi
    done
fi

if [ "$force_compile_all" -eq 1 ] || [[ ${modified[*]} =~ Sudoku.html ]]
then
    minify Sudoku.html > index.html
    echo -e "\033[33mMinified HTML\033[0m"
fi

# minify css/Sudoku.css > css/Sudoku.min.css
# minify css/dark.css > css/dark.min.css
# minify css/light.css > css/light.min.css
# minify css/pumpkin.css > css/pumpkin.min.css
# echo -e "\033[36mMinified CSS\033[0m"
echo -e "\033[32mEnd of build\033[0m"
