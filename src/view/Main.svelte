<script lang="ts">
  import Tagify from '@yaireo/tagify'
  import '@yaireo/tagify/dist/tagify.css'
  import TopBar from './TopBar.svelte'
  import {onMount} from 'svelte'
  import TextEditor from './TextEditor.svelte'
  import FileContent from './FileContent.svelte'

  onMount(() => {
    const inputElm = document.querySelector('#tag_input')
    const tags = new Tagify(inputElm)
    // console.log(tags)
  })
</script>
<div class="w-100" style="height: 100%;">
  <TopBar />
  <FileContent />
  <!--<div style="width: 100%;">
    <input id="tag_input" style="width: 200px;" />
  </div>-->
</div>
