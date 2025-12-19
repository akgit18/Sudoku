#! /bin/bash -e

force_compile_all=0
save_intermediate=0
debug=""
while getopts ":asd" opt; do
    case $opt in
        a)
            force_compile_all=1
            ;;
        d)
            debug="--debug"
            ;;
        s)
            save_intermediate=1
            ;;
        \?)
            echo "Unrecognized flag: -${OPTARG}"
            ;;
    esac
done

echo -e "\033[32mStarting build\033[0m"
modified="`git status --short | awk '{print $2}'`"

remove_intermediate_js() {
    rm -rf intermediate
    rm -rf js
}

compile_all_ts() {
    common_files=( js/common/*.js )
    num_common_files=${#common_files[@]}
    ui_files=( js/ui/*.js )
    num_ui_files=${#ui_files[@]}
    solver_files=( js/solver/*.js )
    num_solver_files=${#solver_files[@]}

    google-closure-compiler -O ADVANCED --module_resolution=NODE --chunk_output_type=ES_MODULES --externs ts/ui/externs.js \
    --create_source_map "%outname%.map" --source_map_location_mapping "ts/|/ts/" \
    --chunk_output_path_prefix intermediate/ \
    --chunk="common:${num_common_files}::${repo_root}/js/closure/common/common.js" ${common_files[@]} \
    --chunk="ui:${num_ui_files}:common" ${ui_files[@]} \
    --chunk="solver:${num_solver_files}:common:${repo_root}/dist/bolver/dolver.min.js" ${solver_files[@]} $debug

    google-closure-compiler -O SIMPLE --module_resolution=NODE --externs ts/ui/externs.js --create_source_map "%outname%.map" --source_map_input "intermediate/common.js|intermediate/common.js.map" --source_map_input "intermediate/ui.js|intermediate/ui.js.map" --output_wrapper "%output%//# sourceMappingURL=ui.min.mjs.map" --chunk_output_type=ES_MODULES intermediate/common.js intermediate/ui.js --js_output_file dist/ui/ui.min.mjs $debug

    google-closure-compiler -O SIMPLE --module_resolution=NODE --create_source_map "%outname%.map" --source_map_input "intermediate/common.js|intermediate/common.js.map" --source_map_input "intermediate/solver.js|intermediate/solver.js.map" --output_wrapper "%output%//# sourceMappingURL=solver.min.mjs.map" --chunk_output_type=ES_MODULES intermediate/common.js intermediate/solver.js --js_output_file dist/solver/solver.min.mjs $debug

    echo -e "\033[34mClosure compilation done\033[0m"
}

for tsfile in ts/common/* ts/ui/* ts/solver/* tsconfig.base.json; do
    if [ "$force_compile_all" -eq 1 ] || [[ ${modified[*]} =~ $tsfile ]]; then
        tsc -b ts/common/ ts/ui/ ts/solver/
        echo -e "\033[36mtsc compilation done\033[0m"
        compile_all_ts
        if [ "$save_intermediate" -eq 0 ]; then
            remove_intermediate_js
        fi
        break
    fi
done
 
if [ "$force_compile_all" -eq 1 ] || [[ ${modified[*]} =~ Sudoku.html ]]
then
    minify Sudoku.html > index.html
    echo -e "\033[33mMinified HTML\033[0m"
fi

# minify css/Sudoku.css > css/Sudoku.min.css
# minify css/dark.css > css/dark.min.css
# minify css/light.css > css/light.min.css
# minify css/pumpkin.css > css/pumpkin.min.css
# echo -e "\033[35mMinified CSS\033[0m"
echo -e "\033[32mEnd of build\033[0m"
