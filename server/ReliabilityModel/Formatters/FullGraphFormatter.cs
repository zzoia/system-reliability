namespace ReliabilityModel.Model.Formatters
{
    public class FullGraphFormatter : GraphFormatter
    {
        public FullGraphFormatter(StateFilteringStrategy stateFilteringStrategy) : base(
            stateFilteringStrategy,
            state => $"{state}{GetStateSuffix(state)}")
        {

        }
    }
}